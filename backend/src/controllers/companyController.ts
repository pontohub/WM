import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole } from '@prisma/client'

export class CompanyController {
  static async getCompanies(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      // Se não for admin, mostrar apenas empresas que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.companyUsers = {
          some: {
            userId: req.user?.id,
          },
        }
      }

      // Get companies with pagination
      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
          include: {
            companyUsers: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
            projects: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            _count: {
              select: {
                projects: true,
                contracts: true,
                invoices: true,
              },
            },
          },
        }),
        prisma.company.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        companies,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Empresas obtidas com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter empresas:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getCompanyById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          companyUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
          projects: {
            include: {
              _count: {
                select: {
                  tasks: true,
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
              createdAt: true,
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
              projects: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      if (!company) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se o usuário tem acesso à empresa
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = company.companyUsers.some(cu => cu.userId === req.user?.id)
        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta empresa')
        }
      }

      return ResponseHelper.success(res, company, 'Empresa obtida com sucesso')
    } catch (error) {
      console.error('Erro ao obter empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { name, email, phone, website, address, taxId, logoUrl } = req.body

      // Verificar se a empresa já existe
      const existingCompany = await prisma.company.findFirst({
        where: {
          OR: [
            { email },
            { name },
          ],
        },
      })

      if (existingCompany) {
        return ResponseHelper.validationError(res, {
          email: existingCompany.email === email ? ['Este email já está em uso'] : [],
          name: existingCompany.name === name ? ['Este nome já está em uso'] : [],
        })
      }

      // Criar empresa
      const company = await prisma.company.create({
        data: {
          name,
          email,
          phone,
          website,
          address,
          taxId,
          logoUrl,
        },
        include: {
          _count: {
            select: {
              projects: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      return ResponseHelper.created(res, company, 'Empresa criada com sucesso')
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { name, email, phone, website, address, taxId, logoUrl, isActive } = req.body

      // Verificar se a empresa existe
      const existingCompany = await prisma.company.findUnique({
        where: { id },
      })

      if (!existingCompany) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se email/nome já estão em uso por outra empresa
      if (email || name) {
        const conflictCompany = await prisma.company.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(email ? [{ email }] : []),
                  ...(name ? [{ name }] : []),
                ],
              },
            ],
          },
        })

        if (conflictCompany) {
          return ResponseHelper.validationError(res, {
            email: conflictCompany.email === email ? ['Este email já está em uso'] : [],
            name: conflictCompany.name === name ? ['Este nome já está em uso'] : [],
          })
        }
      }

      // Atualizar empresa
      const company = await prisma.company.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          website,
          address,
          taxId,
          logoUrl,
          isActive,
        },
        include: {
          _count: {
            select: {
              projects: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      return ResponseHelper.updated(res, company, 'Empresa atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a empresa existe
      const existingCompany = await prisma.company.findUnique({
        where: { id },
        include: {
          projects: true,
          contracts: true,
          invoices: true,
        },
      })

      if (!existingCompany) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se há projetos, contratos ou faturas associados
      if (existingCompany.projects.length > 0 || 
          existingCompany.contracts.length > 0 || 
          existingCompany.invoices.length > 0) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir empresa com projetos, contratos ou faturas associados',
          400
        )
      }

      // Excluir empresa
      await prisma.company.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Empresa excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async addUserToCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { userId, role = UserRole.CLIENT } = req.body

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id },
      })

      if (!company) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Verificar se o usuário já está associado à empresa
      const existingAssociation = await prisma.companyUser.findFirst({
        where: {
          companyId: id,
          userId,
        },
      })

      if (existingAssociation) {
        return ResponseHelper.error(res, 'Usuário já está associado a esta empresa', 400)
      }

      // Criar associação
      const companyUser = await prisma.companyUser.create({
        data: {
          companyId: id,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      })

      return ResponseHelper.created(res, companyUser, 'Usuário adicionado à empresa com sucesso')
    } catch (error) {
      console.error('Erro ao adicionar usuário à empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async removeUserFromCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params

      // Verificar se a associação existe
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          companyId: id,
          userId,
        },
      })

      if (!companyUser) {
        return ResponseHelper.notFound(res, 'Associação não encontrada')
      }

      // Remover associação
      await prisma.companyUser.delete({
        where: {
          id: companyUser.id,
        },
      })

      return ResponseHelper.deleted(res, 'Usuário removido da empresa com sucesso')
    } catch (error) {
      console.error('Erro ao remover usuário da empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getCompanyStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id },
      })

      if (!company) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Buscar estatísticas da empresa
      const [
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        totalContracts,
        signedContracts,
        totalInvoices,
        paidInvoices,
        totalRevenue,
        pendingRevenue,
      ] = await Promise.all([
        prisma.project.count({
          where: { companyId: id },
        }),
        prisma.project.count({
          where: { companyId: id, status: 'ACTIVE' },
        }),
        prisma.project.count({
          where: { companyId: id, status: 'COMPLETED' },
        }),
        prisma.task.count({
          where: { project: { companyId: id } },
        }),
        prisma.task.count({
          where: { project: { companyId: id }, status: 'COMPLETED' },
        }),
        prisma.contract.count({
          where: { companyId: id },
        }),
        prisma.contract.count({
          where: { companyId: id, status: 'SIGNED' },
        }),
        prisma.invoice.count({
          where: { companyId: id },
        }),
        prisma.invoice.count({
          where: { companyId: id, status: 'PAID' },
        }),
        prisma.invoice.aggregate({
          where: { companyId: id, status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.invoice.aggregate({
          where: { companyId: id, status: { in: ['DRAFT', 'SENT', 'OVERDUE'] } },
          _sum: { totalAmount: true },
        }),
      ])

      const stats = {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalContracts,
        signedContracts,
        totalInvoices,
        paidInvoices,
        overdueInvoices: totalInvoices - paidInvoices,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        pendingRevenue: Number(pendingRevenue._sum.totalAmount || 0),
        projectCompletionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas da empresa obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas da empresa:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

