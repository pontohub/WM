import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest, NotFoundError, ValidationError } from '../types'
import { UserRole } from '@prisma/client'

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if (role) {
        where.role = role as UserRole
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
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
        }),
        prisma.user.count({ where }),
      ])

      const totalPages = Math.ceil(total / take)

      return ResponseHelper.paginated(
        res,
        users,
        {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        'Usuários obtidos com sucesso'
      )
    } catch (error) {
      console.error('Erro ao obter usuários:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const user = await prisma.user.findUnique({
        where: { id },
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
          companyUsers: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      })

      if (!user) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      return ResponseHelper.success(res, user, 'Usuário obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter usuário:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { email, password, firstName, lastName, role = UserRole.EMPLOYEE, phone } = req.body

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return ResponseHelper.validationError(res, {
          email: ['Este email já está em uso'],
        })
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10)

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          phone,
        },
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

      return ResponseHelper.created(res, user, 'Usuário criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { firstName, lastName, role, phone, avatarUrl, isActive } = req.body

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Atualizar usuário
      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          role,
          phone,
          avatarUrl,
          isActive,
        },
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

      return ResponseHelper.updated(res, user, 'Usuário atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Verificar se não é o próprio usuário logado
      if (req.user?.id === id) {
        return ResponseHelper.error(res, 'Você não pode excluir sua própria conta', 400)
      }

      // Soft delete - apenas desativar o usuário
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
        },
      })

      return ResponseHelper.deleted(res, 'Usuário desativado com sucesso')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async changeUserPassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { newPassword } = req.body

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Hash da nova senha
      const passwordHash = await bcrypt.hash(newPassword, 10)

      // Atualizar senha
      await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
        },
      })

      return ResponseHelper.success(res, null, 'Senha alterada com sucesso')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getUserStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Buscar estatísticas do usuário
      const [
        totalTasks,
        completedTasks,
        totalHours,
        billableHours,
        approvedHours,
        totalProjects,
      ] = await Promise.all([
        prisma.task.count({
          where: { assignedTo: id },
        }),
        prisma.task.count({
          where: { assignedTo: id, status: 'COMPLETED' },
        }),
        prisma.timeEntry.aggregate({
          where: { userId: id },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { userId: id, isBillable: true },
          _sum: { durationMinutes: true },
        }),
        prisma.timeEntry.aggregate({
          where: { userId: id, isApproved: true },
          _sum: { durationMinutes: true },
        }),
        prisma.project.count({
          where: {
            tasks: {
              some: { assignedTo: id },
            },
          },
        }),
      ])

      const stats = {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalHours: Math.round((totalHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        billableHours: Math.round((billableHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        approvedHours: Math.round((approvedHours._sum.durationMinutes || 0) / 60 * 100) / 100,
        totalProjects,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas do usuário obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas do usuário:', error)
      return ResponseHelper.serverError(res)
    }
  }
}

