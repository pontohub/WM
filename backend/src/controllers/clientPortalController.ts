import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole, ProjectStatus, TaskStatus, InvoiceStatus, ContractStatus } from '@prisma/client'

export class ClientPortalController {
  // Dashboard do cliente com resumo geral
  static async getClientDashboard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        include: {
          company: {
            include: {
              projects: {
                include: {
                  tasks: true,
                  _count: {
                    select: {
                      tasks: true,
                    },
                  },
                },
              },
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      if (userCompanies.length === 0) {
        return ResponseHelper.success(res, {
          companies: [],
          summary: {
            totalProjects: 0,
            activeProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            totalContracts: 0,
            signedContracts: 0,
            totalInvoices: 0,
            paidInvoices: 0,
            pendingAmount: 0,
          },
        }, 'Dashboard do cliente obtido com sucesso')
      }

      // Calcular estatísticas gerais
      let totalProjects = 0
      let activeProjects = 0
      let totalTasks = 0
      let completedTasks = 0
      let totalContracts = 0
      let signedContracts = 0
      let totalInvoices = 0
      let paidInvoices = 0
      let pendingAmount = 0

      userCompanies.forEach(uc => {
        const company = uc.company
        
        // Projetos
        totalProjects += company.projects.length
        activeProjects += company.projects.filter(p => p.status === ProjectStatus.ACTIVE).length
        
        // Tarefas
        company.projects.forEach(project => {
          totalTasks += project.tasks.length
          completedTasks += project.tasks.filter(t => t.status === TaskStatus.COMPLETED).length
        })
        
        // Contratos
        totalContracts += company.contracts.length
        signedContracts += company.contracts.filter(c => c.status === ContractStatus.SIGNED).length
        
        // Faturas
        totalInvoices += company.invoices.length
        paidInvoices += company.invoices.filter(i => i.status === InvoiceStatus.PAID).length
        
        // Valor pendente
        company.invoices.forEach(invoice => {
          if (invoice.status !== InvoiceStatus.PAID) {
            pendingAmount += Number(invoice.totalAmount)
          }
        })
      })

      const dashboard = {
        companies: userCompanies.map(uc => ({
          id: uc.company.id,
          name: uc.company.name,
          email: uc.company.email,
          logoUrl: uc.company.logoUrl,
          projectsCount: uc.company.projects.length,
          activeProjectsCount: uc.company.projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          contractsCount: uc.company.contracts.length,
          invoicesCount: uc.company.invoices.length,
        })),
        summary: {
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          totalContracts,
          signedContracts,
          totalInvoices,
          paidInvoices,
          pendingAmount,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          projectCompletionRate: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0,
        },
      }

      return ResponseHelper.success(res, dashboard, 'Dashboard do cliente obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter dashboard do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Listar projetos do cliente
  static async getClientProjects(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status,
        companyId,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      if (companyIds.length === 0) {
        return ResponseHelper.paginated(
          res,
          [],
          {
            page: Number(page),
            limit: take,
            total: 0,
            totalPages: 0,
          },
          'Projetos do cliente obtidos com sucesso'
        )
      }

      // Build where clause
      const where: any = {
        companyId: { in: companyIds },
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as ProjectStatus
      }

      if (companyId && companyIds.includes(companyId as string)) {
        where.companyId = companyId as string
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
            _count: {
              select: {
                tasks: true,
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
        'Projetos do cliente obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter projetos do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Obter detalhes de um projeto específico
  static async getClientProject(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      // Buscar projeto
      const project = await prisma.project.findFirst({
        where: {
          id,
          companyId: { in: companyIds },
        },
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
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
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
            orderBy: {
              createdAt: 'desc',
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

      return ResponseHelper.success(res, project, 'Projeto obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter projeto do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Listar contratos do cliente
  static async getClientContracts(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status,
        companyId,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      if (companyIds.length === 0) {
        return ResponseHelper.paginated(
          res,
          [],
          {
            page: Number(page),
            limit: take,
            total: 0,
            totalPages: 0,
          },
          'Contratos do cliente obtidos com sucesso'
        )
      }

      // Build where clause
      const where: any = {
        companyId: { in: companyIds },
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as ContractStatus
      }

      if (companyId && companyIds.includes(companyId as string)) {
        where.companyId = companyId as string
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
        'Contratos do cliente obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter contratos do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Listar faturas do cliente
  static async getClientInvoices(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status,
        companyId,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      if (companyIds.length === 0) {
        return ResponseHelper.paginated(
          res,
          [],
          {
            page: Number(page),
            limit: take,
            total: 0,
            totalPages: 0,
          },
          'Faturas do cliente obtidas com sucesso'
        )
      }

      // Build where clause
      const where: any = {
        companyId: { in: companyIds },
      }
      
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status as InvoiceStatus
      }

      if (companyId && companyIds.includes(companyId as string)) {
        where.companyId = companyId as string
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
            items: true,
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
        'Faturas do cliente obtidas com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter faturas do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Obter detalhes de uma fatura específica
  static async getClientInvoice(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      // Buscar fatura
      const invoice = await prisma.invoice.findFirst({
        where: {
          id,
          companyId: { in: companyIds },
        },
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

      return ResponseHelper.success(res, invoice, 'Fatura obtida com sucesso')
    } catch (error) {
      console.error('Erro ao obter fatura do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Obter relatório de atividades do cliente
  static async getClientActivityReport(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id
      const { 
        startDate, 
        endDate, 
        companyId,
        projectId 
      } = req.query

      // Verificar se o usuário é um cliente
      if (req.user?.role !== UserRole.CLIENT) {
        return ResponseHelper.forbidden(res, 'Acesso restrito a clientes')
      }

      // Buscar empresas do cliente
      const userCompanies = await prisma.companyUser.findMany({
        where: { userId },
        select: { companyId: true },
      })

      const companyIds = userCompanies.map(uc => uc.companyId)

      if (companyIds.length === 0) {
        return ResponseHelper.success(res, {
          timeEntries: [],
          summary: {
            totalHours: 0,
            billableHours: 0,
            totalTasks: 0,
            completedTasks: 0,
          },
        }, 'Relatório de atividades obtido com sucesso')
      }

      // Build where clause for time entries
      const timeEntryWhere: any = {
        task: {
          project: {
            companyId: { in: companyIds },
          },
        },
      }

      if (startDate) {
        timeEntryWhere.startTime = { gte: new Date(startDate as string) }
      }

      if (endDate) {
        timeEntryWhere.startTime = { 
          ...timeEntryWhere.startTime,
          lte: new Date(endDate as string) 
        }
      }

      if (companyId && companyIds.includes(companyId as string)) {
        timeEntryWhere.task.project.companyId = companyId as string
      }

      if (projectId) {
        timeEntryWhere.task.projectId = projectId as string
      }

      // Buscar registros de tempo
      const timeEntries = await prisma.timeEntry.findMany({
        where: timeEntryWhere,
        include: {
          task: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      })

      // Calcular estatísticas
      const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0)
      const billableMinutes = timeEntries
        .filter(entry => entry.isBillable)
        .reduce((sum, entry) => sum + entry.durationMinutes, 0)

      const totalHours = Math.round((totalMinutes / 60) * 100) / 100
      const billableHours = Math.round((billableMinutes / 60) * 100) / 100

      // Buscar tarefas relacionadas
      const taskWhere: any = {
        project: {
          companyId: { in: companyIds },
        },
      }

      if (companyId && companyIds.includes(companyId as string)) {
        taskWhere.project.companyId = companyId as string
      }

      if (projectId) {
        taskWhere.projectId = projectId as string
      }

      const [totalTasks, completedTasks] = await Promise.all([
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ 
          where: { 
            ...taskWhere, 
            status: TaskStatus.COMPLETED 
          } 
        }),
      ])

      const report = {
        timeEntries,
        summary: {
          totalHours,
          billableHours,
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
      }

      return ResponseHelper.success(res, report, 'Relatório de atividades obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter relatório de atividades do cliente:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

