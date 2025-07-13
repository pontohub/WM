import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole, ContractStatus } from '@prisma/client'

export class ContractController {
  static async getContracts(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        companyId,
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
          { content: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as ContractStatus
      }

      if (companyId) {
        where.companyId = companyId as string
      }

      if (projectId) {
        where.projectId = projectId as string
      }

      // Se não for admin, mostrar apenas contratos das empresas que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.company = {
          companyUsers: {
            some: {
              userId: req.user?.id,
            },
          },
        }
      }

      // Get contracts with pagination
      const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
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
            project: {
              select: {
                id: true,
                name: true,
                status: true,
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
          },
        }),
        prisma.contract.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        contracts,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Contratos obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter contratos:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getContractById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              website: true,
              address: true,
              logoUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
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
        },
      })

      if (!contract) {
        return ResponseHelper.notFound(res, 'Contrato não encontrado')
      }

      // Verificar se o usuário tem acesso ao contrato
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId: contract.companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
        }
      }

      return ResponseHelper.success(res, contract, 'Contrato obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createContract(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        companyId, 
        projectId,
        title, 
        content, 
        status = ContractStatus.DRAFT,
        totalValue,
        signedByClient
      } = req.body

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      })

      if (!company) {
        return ResponseHelper.notFound(res, 'Empresa não encontrada')
      }

      // Verificar se o projeto existe (se fornecido)
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
        })

        if (!project) {
          return ResponseHelper.notFound(res, 'Projeto não encontrado')
        }

        if (project.companyId !== companyId) {
          return ResponseHelper.error(
            res,
            'Projeto deve pertencer à mesma empresa do contrato',
            400
          )
        }
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

      // Criar contrato
      const contract = await prisma.contract.create({
        data: {
          companyId,
          projectId,
          title,
          content,
          status,
          totalValue: totalValue ? Number(totalValue) : null,
          signedByClient,
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
          project: {
            select: {
              id: true,
              name: true,
              status: true,
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
        },
      })

      return ResponseHelper.created(res, contract, 'Contrato criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateContract(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { 
        title, 
        content, 
        status,
        totalValue,
        signedByClient
      } = req.body

      // Verificar se o contrato existe
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingContract) {
        return ResponseHelper.notFound(res, 'Contrato não encontrado')
      }

      // Verificar se o usuário tem acesso ao contrato
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingContract.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
        }
      }

      // Verificar se o contrato não está assinado (não pode editar se assinado)
      if (existingContract.status === ContractStatus.SIGNED && req.user?.role !== UserRole.ADMIN) {
        return ResponseHelper.error(
          res,
          'Não é possível editar contrato já assinado',
          400
        )
      }

      // Atualizar contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          title,
          content,
          status,
          totalValue: totalValue ? Number(totalValue) : undefined,
          signedByClient,
          signedAt: status === ContractStatus.SIGNED ? new Date() : undefined,
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
          project: {
            select: {
              id: true,
              name: true,
              status: true,
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
        },
      })

      return ResponseHelper.updated(res, contract, 'Contrato atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteContract(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o contrato existe
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingContract) {
        return ResponseHelper.notFound(res, 'Contrato não encontrado')
      }

      // Verificar se o usuário tem acesso ao contrato
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingContract.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
        }
      }

      // Verificar se o contrato não está assinado
      if (existingContract.status === ContractStatus.SIGNED) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir contrato assinado',
          400
        )
      }

      // Excluir contrato
      await prisma.contract.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Contrato excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async signContract(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o contrato existe
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingContract) {
        return ResponseHelper.notFound(res, 'Contrato não encontrado')
      }

      // Verificar se o usuário tem acesso ao contrato
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingContract.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
        }
      }

      // Verificar se o contrato não está já assinado
      if (existingContract.status === ContractStatus.SIGNED) {
        return ResponseHelper.error(res, 'Contrato já está assinado', 400)
      }

      // Assinar contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          status: ContractStatus.SIGNED,
          signedAt: new Date(),
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
          project: {
            select: {
              id: true,
              name: true,
              status: true,
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
        },
      })

      return ResponseHelper.updated(res, contract, 'Contrato assinado com sucesso')
    } catch (error) {
      console.error('Erro ao assinar contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getContractStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o contrato existe
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!contract) {
        return ResponseHelper.notFound(res, 'Contrato não encontrado')
      }

      // Verificar se o usuário tem acesso ao contrato
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = contract.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
        }
      }

      const stats = {
        contractValue: Number(contract.totalValue || 0),
        status: contract.status,
        signedAt: contract.signedAt,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas do contrato obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas do contrato:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

