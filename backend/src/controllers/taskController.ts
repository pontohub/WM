import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole, TaskStatus, TaskPriority } from '@prisma/client'

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        priority,
        assignedTo,
        projectId, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as TaskStatus
      }

      if (priority) {
        where.priority = priority as TaskPriority
      }

      if (assignedTo) {
        where.assignedTo = assignedTo as string
      }

      if (projectId) {
        where.projectId = projectId as string
      }

      // Se não for admin, mostrar apenas tarefas dos projetos que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.project = {
          company: {
            companyUsers: {
              some: {
                userId: req.user?.id,
              },
            },
          },
        }
      }

      // Get tasks with pagination
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            subtasks: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            _count: {
              select: {
                timeEntries: true,
                comments: true,
                subtasks: true,
              },
            },
          },
        }),
        prisma.task.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        tasks,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Tarefas obtidas com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter tarefas:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          subtasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          timeEntries: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              startTime: 'desc',
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              timeEntries: true,
              comments: true,
              subtasks: true,
            },
          },
        },
      })

      if (!task) {
        return ResponseHelper.notFound(res, 'Tarefa não encontrada')
      }

      // Verificar se o usuário tem acesso à tarefa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId: task.project.companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta tarefa')
        }
      }

      return ResponseHelper.success(res, task, 'Tarefa obtida com sucesso')
    } catch (error) {
      console.error('Erro ao obter tarefa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        projectId, 
        title, 
        description, 
        status = TaskStatus.TODO, 
        priority = TaskPriority.MEDIUM,
        assignedTo,
        estimatedHours,
        dueDate,
        parentTaskId
      } = req.body

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!project) {
        return ResponseHelper.notFound(res, 'Projeto não encontrado')
      }

      // Verificar se o usuário tem acesso ao projeto
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este projeto')
        }
      }

      // Se assignedTo foi fornecido, verificar se o usuário existe e tem acesso ao projeto
      if (assignedTo) {
        const assignee = await prisma.user.findUnique({
          where: { id: assignedTo },
        })

        if (!assignee) {
          return ResponseHelper.notFound(res, 'Usuário atribuído não encontrado')
        }

        // Verificar se o usuário atribuído tem acesso ao projeto
        const assigneeHasAccess = project.company.companyUsers.some(
          cu => cu.userId === assignedTo
        )

        if (!assigneeHasAccess && req.user?.role !== UserRole.ADMIN) {
          return ResponseHelper.error(
            res,
            'Usuário atribuído não tem acesso a este projeto',
            400
          )
        }
      }

      // Se parentTaskId foi fornecido, verificar se a tarefa pai existe
      if (parentTaskId) {
        const parentTask = await prisma.task.findUnique({
          where: { id: parentTaskId },
        })

        if (!parentTask) {
          return ResponseHelper.notFound(res, 'Tarefa pai não encontrada')
        }

        if (parentTask.projectId !== projectId) {
          return ResponseHelper.error(
            res,
            'Tarefa pai deve pertencer ao mesmo projeto',
            400
          )
        }
      }

      // Criar tarefa
      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          description,
          status,
          priority,
          assignedTo,
          estimatedHours: estimatedHours ? Number(estimatedHours) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          parentTaskId,
          createdBy: req.user!.id,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              timeEntries: true,
              comments: true,
              subtasks: true,
            },
          },
        },
      })

      return ResponseHelper.created(res, task, 'Tarefa criada com sucesso')
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { 
        title, 
        description, 
        status, 
        priority,
        assignedTo,
        estimatedHours,
        dueDate
      } = req.body

      // Verificar se a tarefa existe
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  companyUsers: true,
                },
              },
            },
          },
        },
      })

      if (!existingTask) {
        return ResponseHelper.notFound(res, 'Tarefa não encontrada')
      }

      // Verificar se o usuário tem acesso à tarefa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingTask.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta tarefa')
        }
      }

      // Se assignedTo foi fornecido, verificar se o usuário existe e tem acesso ao projeto
      if (assignedTo) {
        const assignee = await prisma.user.findUnique({
          where: { id: assignedTo },
        })

        if (!assignee) {
          return ResponseHelper.notFound(res, 'Usuário atribuído não encontrado')
        }

        // Verificar se o usuário atribuído tem acesso ao projeto
        const assigneeHasAccess = existingTask.project.company.companyUsers.some(
          cu => cu.userId === assignedTo
        )

        if (!assigneeHasAccess && req.user?.role !== UserRole.ADMIN) {
          return ResponseHelper.error(
            res,
            'Usuário atribuído não tem acesso a este projeto',
            400
          )
        }
      }

      // Atualizar tarefa
      const task = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          status,
          priority,
          assignedTo,
          estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              timeEntries: true,
              comments: true,
              subtasks: true,
            },
          },
        },
      })

      return ResponseHelper.updated(res, task, 'Tarefa atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a tarefa existe
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: {
          subtasks: true,
          timeEntries: true,
          comments: true,
          project: {
            include: {
              company: {
                include: {
                  companyUsers: true,
                },
              },
            },
          },
        },
      })

      if (!existingTask) {
        return ResponseHelper.notFound(res, 'Tarefa não encontrada')
      }

      // Verificar se o usuário tem acesso à tarefa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingTask.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta tarefa')
        }
      }

      // Verificar se há subtarefas, registros de tempo ou comentários
      if (existingTask.subtasks.length > 0 || 
          existingTask.timeEntries.length > 0 || 
          existingTask.comments.length > 0) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir tarefa com subtarefas, registros de tempo ou comentários associados',
          400
        )
      }

      // Excluir tarefa
      await prisma.task.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Tarefa excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getTaskStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a tarefa existe
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  companyUsers: true,
                },
              },
            },
          },
        },
      })

      if (!task) {
        return ResponseHelper.notFound(res, 'Tarefa não encontrada')
      }

      // Verificar se o usuário tem acesso à tarefa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = task.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta tarefa')
        }
      }

      // Buscar estatísticas da tarefa
      const [
        totalSubtasks,
        completedSubtasks,
        totalHours,
        billableHours,
        approvedHours,
        totalComments,
      ] = await Promise.all([
        prisma.task.count({
          where: { parentTaskId: id },
        }),
        prisma.task.count({
          where: { parentTaskId: id, status: 'COMPLETED' },
        }),
        prisma.timeEntry.aggregate({
          where: { taskId: id },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { taskId: id, isBillable: true },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { taskId: id, isApproved: true },
          _sum: { durationMinutes: true },
        }),
        prisma.comment.count({
          where: { taskId: id },
        }),
      ])

      const stats = {
        totalSubtasks,
        completedSubtasks,
        pendingSubtasks: totalSubtasks - completedSubtasks,
        totalHours: Math.round((totalHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        billableHours: Math.round((billableHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        approvedHours: Math.round((approvedHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        totalComments,
        subtaskCompletionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
        estimatedVsActual: task.estimatedHours ? {
          estimated: Number(task.estimatedHours),
          actual: Math.round((totalHours._sum.durationMinutes || 0) / 60 * 100) / 100,
          variance: Math.round(((Math.round((totalHours._sum.durationMinutes || 0) / 60 * 100) / 100) - Number(task.estimatedHours)) * 100) / 100,
        } : null,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas da tarefa obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas da tarefa:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

