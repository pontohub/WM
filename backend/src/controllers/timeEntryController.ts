import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole } from '@prisma/client'

export class TimeEntryController {
  static async getTimeEntries(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        userId,
        taskId,
        projectId,
        startDate,
        endDate,
        isBillable,
        isApproved,
        sortBy = 'startTime', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (userId) {
        where.userId = userId as string
      }

      if (taskId) {
        where.taskId = taskId as string
      }

      if (projectId) {
        where.task = {
          projectId: projectId as string
        }
      }

      if (startDate || endDate) {
        where.startTime = {}
        if (startDate) {
          where.startTime.gte = new Date(startDate as string)
        }
        if (endDate) {
          where.startTime.lte = new Date(endDate as string)
        }
      }

      if (isBillable !== undefined) {
        where.isBillable = isBillable === 'true'
      }

      if (isApproved !== undefined) {
        where.isApproved = isApproved === 'true'
      }

      // Se não for admin, mostrar apenas registros dos projetos que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.task = {
          ...where.task,
          project: {
            company: {
              companyUsers: {
                some: {
                  userId: req.user?.id,
                },
              },
            },
          },
        }
      }

      // Get time entries with pagination
      const [timeEntries, total] = await Promise.all([
        prisma.timeEntry.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
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
              },
            },
          },
        }),
        prisma.timeEntry.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        timeEntries,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Registros de tempo obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter registros de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getTimeEntryById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
          task: {
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
            },
          },
        },
      })

      if (!timeEntry) {
        return ResponseHelper.notFound(res, 'Registro de tempo não encontrado')
      }

      // Verificar se o usuário tem acesso ao registro
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId: timeEntry.task.project.companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess && timeEntry.userId !== req.user?.id) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este registro de tempo')
        }
      }

      return ResponseHelper.success(res, timeEntry, 'Registro de tempo obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter registro de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createTimeEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        taskId, 
        description, 
        startTime, 
        endTime,
        durationMinutes,
        isBillable = true,
        hourlyRate
      } = req.body

      // Verificar se a tarefa existe
      const task = await prisma.task.findUnique({
        where: { id: taskId },
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

      // Calcular duração se não fornecida
      let calculatedDuration = durationMinutes
      if (!calculatedDuration && startTime && endTime) {
        const start = new Date(startTime)
        const end = new Date(endTime)
        calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      }

      if (!calculatedDuration || calculatedDuration <= 0) {
        return ResponseHelper.error(res, 'Duração deve ser maior que zero', 400)
      }

      // Verificar se não há sobreposição de tempo para o mesmo usuário
      if (startTime && endTime) {
        const overlappingEntry = await prisma.timeEntry.findFirst({
          where: {
            userId: req.user!.id,
            OR: [
              {
                AND: [
                  { startTime: { lte: new Date(startTime) } },
                  { endTime: { gte: new Date(startTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { lte: new Date(endTime) } },
                  { endTime: { gte: new Date(endTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: new Date(startTime) } },
                  { endTime: { lte: new Date(endTime) } },
                ],
              },
            ],
          },
        })

        if (overlappingEntry) {
          return ResponseHelper.error(
            res,
            'Já existe um registro de tempo neste período',
            400
          )
        }
      }

      // Criar registro de tempo
      const createData: any = {
        taskId,
        userId: req.user!.id,
        description,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        durationMinutes: calculatedDuration,
        isBillable,
      }

      const finalHourlyRate = hourlyRate ? Number(hourlyRate) : (task.project.hourlyRate ? Number(task.project.hourlyRate) : null)
      if (finalHourlyRate !== null) {
        createData.hourlyRate = finalHourlyRate
      }

      const timeEntry = await prisma.timeEntry.create({
        data: createData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      })

      return ResponseHelper.created(res, timeEntry, 'Registro de tempo criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar registro de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateTimeEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { 
        description, 
        startTime, 
        endTime,
        durationMinutes,
        isBillable,
        hourlyRate
      } = req.body

      // Verificar se o registro existe
      const existingTimeEntry = await prisma.timeEntry.findUnique({
        where: { id },
        include: {
          task: {
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
          },
        },
      })

      if (!existingTimeEntry) {
        return ResponseHelper.notFound(res, 'Registro de tempo não encontrado')
      }

      // Verificar se o usuário tem acesso ao registro
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingTimeEntry.task.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess && existingTimeEntry.userId !== req.user?.id) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este registro de tempo')
        }
      }

      // Verificar se o registro não está aprovado (não pode editar se aprovado)
      if (existingTimeEntry.isApproved && req.user?.role !== UserRole.ADMIN) {
        return ResponseHelper.error(
          res,
          'Não é possível editar registro de tempo já aprovado',
          400
        )
      }

      // Calcular duração se não fornecida
      let calculatedDuration = durationMinutes
      if (!calculatedDuration && startTime && endTime) {
        const start = new Date(startTime)
        const end = new Date(endTime)
        calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      }

      // Verificar se não há sobreposição de tempo para o mesmo usuário (excluindo o registro atual)
      if (startTime && endTime) {
        const overlappingEntry = await prisma.timeEntry.findFirst({
          where: {
            id: { not: id },
            userId: existingTimeEntry.userId,
            OR: [
              {
                AND: [
                  { startTime: { lte: new Date(startTime) } },
                  { endTime: { gte: new Date(startTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { lte: new Date(endTime) } },
                  { endTime: { gte: new Date(endTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: new Date(startTime) } },
                  { endTime: { lte: new Date(endTime) } },
                ],
              },
            ],
          },
        })

        if (overlappingEntry) {
          return ResponseHelper.error(
            res,
            'Já existe um registro de tempo neste período',
            400
          )
        }
      }

      // Atualizar registro de tempo
      const timeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          description,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          durationMinutes: calculatedDuration,
          isBillable,
          hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      })

      return ResponseHelper.updated(res, timeEntry, 'Registro de tempo atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar registro de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteTimeEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o registro existe
      const existingTimeEntry = await prisma.timeEntry.findUnique({
        where: { id },
        include: {
          task: {
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
          },
        },
      })

      if (!existingTimeEntry) {
        return ResponseHelper.notFound(res, 'Registro de tempo não encontrado')
      }

      // Verificar se o usuário tem acesso ao registro
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingTimeEntry.task.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess && existingTimeEntry.userId !== req.user?.id) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este registro de tempo')
        }
      }

      // Verificar se o registro não está aprovado (não pode excluir se aprovado)
      if (existingTimeEntry.isApproved && req.user?.role !== UserRole.ADMIN) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir registro de tempo já aprovado',
          400
        )
      }

      // Excluir registro de tempo
      await prisma.timeEntry.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Registro de tempo excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir registro de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async approveTimeEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { isApproved } = req.body

      // Verificar se o registro existe
      const existingTimeEntry = await prisma.timeEntry.findUnique({
        where: { id },
        include: {
          task: {
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
          },
        },
      })

      if (!existingTimeEntry) {
        return ResponseHelper.notFound(res, 'Registro de tempo não encontrado')
      }

      // Verificar se o usuário tem permissão para aprovar (Admin ou Employee)
      if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.EMPLOYEE) {
        return ResponseHelper.forbidden(res, 'Sem permissão para aprovar registros de tempo')
      }

      // Verificar se o usuário tem acesso ao projeto
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingTimeEntry.task.project.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este registro de tempo')
        }
      }

      // Atualizar status de aprovação
      const timeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          isApproved,
          approvedAt: isApproved ? new Date() : null,
          approvedBy: isApproved ? req.user!.id : null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      const message = isApproved ? 'Registro de tempo aprovado com sucesso' : 'Aprovação do registro de tempo removida com sucesso'
      return ResponseHelper.updated(res, timeEntry, message)
    } catch (error) {
      console.error('Erro ao aprovar registro de tempo:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async startTimer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { taskId, description } = req.body

      // Verificar se a tarefa existe
      const task = await prisma.task.findUnique({
        where: { id: taskId },
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

      // Verificar se já existe um timer ativo para o usuário
      const activeTimer = await prisma.timeEntry.findFirst({
        where: {
          userId: req.user!.id,
          endTime: null,
        },
      })

      if (activeTimer) {
        return ResponseHelper.error(res, 'Já existe um timer ativo', 400)
      }

      // Criar novo registro de tempo (timer)
      const createData: any = {
        taskId,
        userId: req.user!.id,
        description,
        startTime: new Date(),
        durationMinutes: 0,
        isBillable: true,
      }

      const projectHourlyRate = task.project.hourlyRate ? Number(task.project.hourlyRate) : null
      if (projectHourlyRate !== null) {
        createData.hourlyRate = projectHourlyRate
      }

      const timeEntry = await prisma.timeEntry.create({
        data: createData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      })

      return ResponseHelper.created(res, timeEntry, 'Timer iniciado com sucesso')
    } catch (error) {
      console.error('Erro ao iniciar timer:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async stopTimer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o registro existe e é um timer ativo
      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id },
        include: {
          task: {
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
          },
        },
      })

      if (!timeEntry) {
        return ResponseHelper.notFound(res, 'Timer não encontrado')
      }

      if (timeEntry.userId !== req.user?.id) {
        return ResponseHelper.forbidden(res, 'Acesso negado a este timer')
      }

      if (timeEntry.endTime) {
        return ResponseHelper.error(res, 'Timer já foi parado', 400)
      }

      // Calcular duração
      const endTime = new Date()
      const durationMinutes = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60))

      // Atualizar registro com tempo final
      const updatedTimeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          endTime,
          durationMinutes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      })

      return ResponseHelper.updated(res, updatedTimeEntry, 'Timer parado com sucesso')
    } catch (error) {
      console.error('Erro ao parar timer:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getActiveTimer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const activeTimer = await prisma.timeEntry.findFirst({
        where: {
          userId: req.user!.id,
          endTime: null,
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
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
            },
          },
        },
      })

      if (!activeTimer) {
        return ResponseHelper.success(res, null, 'Nenhum timer ativo')
      }

      return ResponseHelper.success(res, activeTimer, 'Timer ativo obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter timer ativo:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

