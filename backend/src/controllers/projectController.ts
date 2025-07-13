import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole, ProjectStatus } from '@prisma/client'

export class ProjectController {
  static async getProjects(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        companyId, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as ProjectStatus
      }

      if (companyId) {
        where.companyId = companyId as string
      }

      // Se não for admin, mostrar apenas projetos das empresas que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.company = {
          companyUsers: {
            some: {
              userId: req.user?.id,
            },
          },
        }
      }

      // Get projects with pagination
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                logoUrl: true,
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
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                assignedTo: true,
                assignee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                tasks: true,
                contracts: true,
                invoices: true,
              },
            },
          },
        }),
        prisma.project.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        projects,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Projetos obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter projetos:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              website: true,
              logoUrl: true,
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
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: {
                  timeEntries: true,
                  comments: true,
                },
              },
            },
          },
          contracts: {
            select: {
              id: true,
              title: true,
              status: true,
              totalValue: true,
              signedAt: true,
            },
          },
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              totalAmount: true,
              dueDate: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      if (!project) {
        return ResponseHelper.notFound(res, 'Projeto não encontrado')
      }

      // Verificar se o usuário tem acesso ao projeto
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId: project.companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este projeto')
        }
      }

      return ResponseHelper.success(res, project, 'Projeto obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter projeto:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        companyId, 
        name, 
        description, 
        status = ProjectStatus.PLANNING, 
        startDate, 
        endDate, 
        budget, 
        hourlyRate 
      } = req.body

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      })

      if (!company) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se o usuário tem acesso à empresa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta empresa')
        }
      }

      // Criar projeto
      const project = await prisma.project.create({
        data: {
          companyId,
          name,
          description,
          status,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          budget: budget ? Number(budget) : null,
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          createdBy: req.user!.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              logoUrl: true,
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
              tasks: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      return ResponseHelper.created(res, project, 'Projeto criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { 
        name, 
        description, 
        status, 
        startDate, 
        endDate, 
        budget, 
        hourlyRate 
      } = req.body

      // Verificar se o projeto existe
      const existingProject = await prisma.project.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingProject) {
        return ResponseHelper.notFound(res, 'Projeto não encontrado')
      }

      // Verificar se o usuário tem acesso ao projeto
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingProject.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este projeto')
        }
      }

      // Atualizar projeto
      const project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          status,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          budget: budget ? Number(budget) : undefined,
          hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              logoUrl: true,
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
              tasks: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      return ResponseHelper.updated(res, project, 'Projeto atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o projeto existe
      const existingProject = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: true,
          contracts: true,
          invoices: true,
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingProject) {
        return ResponseHelper.notFound(res, 'Projeto não encontrado')
      }

      // Verificar se o usuário tem acesso ao projeto
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingProject.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este projeto')
        }
      }

      // Verificar se há tarefas, contratos ou faturas associados
      if (existingProject.tasks.length > 0 || 
          existingProject.contracts.length > 0 || 
          existingProject.invoices.length > 0) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir projeto com tarefas, contratos ou faturas associados',
          400
        )
      }

      // Excluir projeto
      await prisma.project.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Projeto excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getProjectStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id },
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

      // Buscar estatísticas do projeto
      const [
        totalTasks,
        completedTasks,
        totalHours,
        billableHours,
        approvedHours,
        totalContracts,
        signedContracts,
        totalInvoices,
        paidInvoices,
        totalRevenue,
        teamMembers,
      ] = await Promise.all([
        prisma.task.count({
          where: { projectId: id },
        }),
        prisma.task.count({
          where: { projectId: id, status: 'COMPLETED' },
        }),
        prisma.timeEntry.aggregate({
          where: { task: { projectId: id } },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { task: { projectId: id }, isBillable: true },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { task: { projectId: id }, isApproved: true },
          _sum: { durationMinutes: true },
        }),
        prisma.contract.count({
          where: { projectId: id },
        }),
        prisma.contract.count({
          where: { projectId: id, status: 'SIGNED' },
        }),
        prisma.invoice.count({
          where: { projectId: id },
        }),
        prisma.invoice.count({
          where: { projectId: id, status: 'PAID' },
        }),
        prisma.invoice.aggregate({
          where: { projectId: id, status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.task.findMany({
          where: { projectId: id, assignedTo: { not: null } },
          select: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          distinct: ['assignedTo'],
        }),
      ])

      const stats = {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalHours: Math.round((totalHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        billableHours: Math.round((billableHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        approvedHours: Math.round((approvedHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        totalContracts,
        signedContracts,
        totalInvoices,
        paidInvoices,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        teamMembers: teamMembers.map(t => t.assignee).filter(Boolean),
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        budgetUsed: project.budget ? Math.round((Number(totalRevenue._sum.totalAmount || 0) / Number(project.budget)) * 100) : 0,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas do projeto obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas do projeto:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

