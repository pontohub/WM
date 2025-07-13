import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole, InvoiceStatus } from '@prisma/client'

export class InvoiceController {
  static async getInvoices(req: AuthenticatedRequest, res: Response): Promise<Response> {
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
          { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as InvoiceStatus
      }

      if (companyId) {
        where.companyId = companyId as string
      }

      if (projectId) {
        where.projectId = projectId as string
      }

      // Se não for admin, mostrar apenas faturas das empresas que o usuário tem acesso
      if (req.user?.role !== UserRole.ADMIN) {
        where.company = {
          companyUsers: {
            some: {
              userId: req.user?.id,
            },
          },
        }
      }

      // Get invoices with pagination
      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
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
            items: {
              select: {
                id: true,
                description: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
        }),
        prisma.invoice.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        invoices,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Faturas obtidas com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter faturas:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const invoice = await prisma.invoice.findUnique({
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
              taxId: true,
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
          items: {
            orderBy: {
              id: 'asc',
            },
          },
        },
      })

      if (!invoice) {
        return ResponseHelper.notFound(res, 'Fatura não encontrada')
      }

      // Verificar se o usuário tem acesso à fatura
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = await prisma.companyUser.findFirst({
          where: {
            companyId: invoice.companyId,
            userId: req.user?.id,
          },
        })

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta fatura')
        }
      }

      return ResponseHelper.success(res, invoice, 'Fatura obtida com sucesso')
    } catch (error) {
      console.error('Erro ao obter fatura:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createInvoice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { 
        companyId, 
        projectId,
        invoiceNumber,
        description,
        dueDate,
        status = InvoiceStatus.DRAFT,
        taxRate,
        items
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
            'Projeto deve pertencer à mesma empresa da fatura',
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

      // Verificar se o número da fatura já existe
      if (invoiceNumber) {
        const existingInvoice = await prisma.invoice.findFirst({
          where: { invoiceNumber },
        })

        if (existingInvoice) {
          return ResponseHelper.error(res, 'Número da fatura já existe', 400)
        }
      }

      // Calcular totais dos itens
      let subtotalAmount = 0
      if (items && items.length > 0) {
        subtotalAmount = items.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) * Number(item.unitPrice))
        }, 0)
      }

      const taxAmount = taxRate ? (subtotalAmount * Number(taxRate)) / 100 : 0
      const totalAmount = subtotalAmount + taxAmount

      // Criar fatura
      const invoice = await prisma.invoice.create({
        data: {
          companyId,
          projectId,
          invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
          description,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          status,
          subtotal: subtotalAmount,
          taxRate: taxRate ? Number(taxRate) : 0,
          taxAmount,
          totalAmount,
          createdBy: req.user!.id,
          items: items ? {
            create: items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.quantity) * Number(item.unitPrice),
            }))
          } : undefined,
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
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      })

      return ResponseHelper.created(res, invoice, 'Fatura criada com sucesso')
    } catch (error) {
      console.error('Erro ao criar fatura:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateInvoice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { 
        invoiceNumber,
        description,
        dueDate,
        status,
        taxRate,
        items
      } = req.body

      // Verificar se a fatura existe
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
          items: true,
        },
      })

      if (!existingInvoice) {
        return ResponseHelper.notFound(res, 'Fatura não encontrada')
      }

      // Verificar se o usuário tem acesso à fatura
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingInvoice.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta fatura')
        }
      }

      // Verificar se a fatura não está paga (não pode editar se paga)
      if (existingInvoice.status === InvoiceStatus.PAID && req.user?.role !== UserRole.ADMIN) {
        return ResponseHelper.error(
          res,
          'Não é possível editar fatura já paga',
          400
        )
      }

      // Verificar se o número da fatura já existe (se alterado)
      if (invoiceNumber && invoiceNumber !== existingInvoice.invoiceNumber) {
        const duplicateInvoice = await prisma.invoice.findFirst({
          where: { 
            invoiceNumber,
            id: { not: id }
          },
        })

        if (duplicateInvoice) {
          return ResponseHelper.error(res, 'Número da fatura já existe', 400)
        }
      }

      // Calcular totais dos itens (se fornecidos)
      let subtotalAmount = Number(existingInvoice.subtotal)
      if (items) {
        subtotalAmount = items.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) * Number(item.unitPrice))
        }, 0)
      }

      const finalTaxRate = taxRate !== undefined ? Number(taxRate) : Number(existingInvoice.taxRate)
      
      const taxAmount = (subtotalAmount * finalTaxRate) / 100
      const totalAmount = subtotalAmount + taxAmount

      // Atualizar fatura
      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          invoiceNumber,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          status,
          subtotal: subtotalAmount,
          taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
          taxAmount,
          totalAmount,
          paidAt: status === InvoiceStatus.PAID ? new Date() : undefined,
          items: items ? {
            deleteMany: {},
            create: items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.quantity) * Number(item.unitPrice),
            }))
          } : undefined,
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
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      })

      return ResponseHelper.updated(res, invoice, 'Fatura atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteInvoice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a fatura existe
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingInvoice) {
        return ResponseHelper.notFound(res, 'Fatura não encontrada')
      }

      // Verificar se o usuário tem acesso à fatura
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingInvoice.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta fatura')
        }
      }

      // Verificar se a fatura não está paga
      if (existingInvoice.status === InvoiceStatus.PAID) {
        return ResponseHelper.error(
          res,
          'Não é possível excluir fatura já paga',
          400
        )
      }

      // Excluir fatura (e itens em cascata)
      await prisma.invoice.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Fatura excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir fatura:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async markAsPaid(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se a fatura existe
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              companyUsers: true,
            },
          },
        },
      })

      if (!existingInvoice) {
        return ResponseHelper.notFound(res, 'Fatura não encontrada')
      }

      // Verificar se o usuário tem acesso à fatura
      if (req.user?.role !== UserRole.ADMIN) {
        const hasAccess = existingInvoice.company.companyUsers.some(
          cu => cu.userId === req.user?.id
        )

        if (!hasAccess) {
          return ResponseHelper.forbidden(res, 'Acesso negado a esta fatura')
        }
      }

      // Verificar se a fatura não está já paga
      if (existingInvoice.status === InvoiceStatus.PAID) {
        return ResponseHelper.error(res, 'Fatura já está paga', 400)
      }

      // Marcar como paga
      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
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
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      })

      return ResponseHelper.updated(res, invoice, 'Fatura marcada como paga com sucesso')
    } catch (error) {
      console.error('Erro ao marcar fatura como paga:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

