import { Response, NextFunction } from 'express'
import { AuthenticatedRequest, UnauthorizedError, ForbiddenError } from '../types'
import { JwtHelper } from '../utils/jwt'
import { ResponseHelper } from '../utils/response'
import { prisma } from '../lib/database'
import { UserRole } from '@prisma/client'

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JwtHelper.extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      throw new UnauthorizedError('Token de acesso não fornecido')
    }

    const payload = JwtHelper.verifyAccessToken(token)
    
    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado')
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Usuário inativo')
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        message: error.message,
      })
    } else {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      })
    }
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.',
      })
      return
    }

    next()
  }
}

export const authorizeOwnerOrAdmin = (userIdField = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      })
      return
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField]
    
    // Admin pode acessar qualquer recurso
    if (req.user.role === UserRole.ADMIN) {
      next()
      return
    }

    // Usuário só pode acessar seus próprios recursos
    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      })
      return
    }

    next()
  }
}

export const authorizeCompanyAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      })
      return
    }

    // Admin tem acesso a todas as empresas
    if (req.user.role === UserRole.ADMIN) {
      next()
      return
    }

    const companyId = req.params.companyId || req.body.companyId

    if (!companyId) {
      res.status(400).json({
        success: false,
        message: 'ID da empresa não fornecido',
      })
      return
    }

    // Verificar se o usuário tem acesso à empresa
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        companyId,
        userId: req.user.id,
      },
    })

    if (!companyUser) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar esta empresa.',
      })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    })
  }
}

export const authorizeProjectAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      })
      return
    }

    // Admin tem acesso a todos os projetos
    if (req.user.role === UserRole.ADMIN) {
      next()
      return
    }

    const projectId = req.params.projectId || req.body.projectId

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: 'ID do projeto não fornecido',
      })
      return
    }

    // Buscar projeto e verificar acesso
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: {
          include: {
            companyUsers: {
              where: { userId: req.user.id },
            },
          },
        },
      },
    })

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
      })
      return
    }

    // Verificar se o usuário tem acesso à empresa do projeto
    if (project.company.companyUsers.length === 0) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este projeto.',
      })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JwtHelper.extractTokenFromHeader(req.headers.authorization)
    
    if (token) {
      const payload = JwtHelper.verifyAccessToken(token)
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next()
  }
}



// Middleware para autorizar acesso a tarefas
export const authorizeTaskAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user!

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return next()
    }

    // Buscar tarefa com informações do projeto e empresa
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
      ResponseHelper.notFound(res, 'Tarefa não encontrada')
      return
    }

    // Verificar se o usuário tem acesso à empresa do projeto
    const hasAccess = task.project.company.companyUsers.some(
      cu => cu.userId === user.id
    )

    if (!hasAccess) {
      ResponseHelper.forbidden(res, 'Acesso negado a esta tarefa')
      return
    }

    next()
  } catch (error) {
    console.error('Erro na autorização de tarefa:', error)
    ResponseHelper.serverError(res)
  }
}

// Middleware para autorizar acesso a registros de tempo
export const authorizeTimeEntryAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user!

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return next()
    }

    // Buscar registro de tempo com informações da tarefa, projeto e empresa
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
      ResponseHelper.notFound(res, 'Registro de tempo não encontrado')
      return
    }

    // Verificar se é o próprio usuário ou se tem acesso à empresa
    const isOwner = timeEntry.userId === user.id
    const hasCompanyAccess = timeEntry.task.project.company.companyUsers.some(
      cu => cu.userId === user.id
    )

    if (!isOwner && !hasCompanyAccess) {
      ResponseHelper.forbidden(res, 'Acesso negado a este registro de tempo')
      return
    }

    next()
  } catch (error) {
    console.error('Erro na autorização de registro de tempo:', error)
    ResponseHelper.serverError(res)
  }
}


// Middleware para autorizar acesso a contratos
export const authorizeContractAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user!

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return next()
    }

    // Buscar contrato com informações da empresa
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
      ResponseHelper.notFound(res, 'Contrato não encontrado')
      return
    }

    // Verificar se o usuário tem acesso à empresa do contrato
    const hasAccess = contract.company.companyUsers.some(
      cu => cu.userId === user.id
    )

    if (!hasAccess) {
      ResponseHelper.forbidden(res, 'Acesso negado a este contrato')
      return
    }

    next()
  } catch (error) {
    console.error('Erro na autorização de contrato:', error)
    ResponseHelper.serverError(res)
  }
}

// Middleware para autorizar acesso a faturas
export const authorizeInvoiceAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const user = req.user!

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return next()
    }

    // Buscar fatura com informações da empresa
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            companyUsers: true,
          },
        },
      },
    })

    if (!invoice) {
      ResponseHelper.notFound(res, 'Fatura não encontrada')
      return
    }

    // Verificar se o usuário tem acesso à empresa da fatura
    const hasAccess = invoice.company.companyUsers.some(
      cu => cu.userId === user.id
    )

    if (!hasAccess) {
      ResponseHelper.forbidden(res, 'Acesso negado a esta fatura')
      return
    }

    next()
  } catch (error) {
    console.error('Erro na autorização de fatura:', error)
    ResponseHelper.serverError(res)
  }
}

