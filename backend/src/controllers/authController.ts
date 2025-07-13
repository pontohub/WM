import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/database'
import { JwtHelper } from '../utils/jwt'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest, UnauthorizedError, ValidationError } from '../types'
import { UserRole } from '@prisma/client'

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, firstName, lastName, role = UserRole.EMPLOYEE } = req.body

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

      // Gerar tokens
      const { accessToken, refreshToken } = JwtHelper.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      return ResponseHelper.created(res, {
        user,
        accessToken,
        refreshToken,
      }, 'Usuário criado com sucesso')
    } catch (error) {
      console.error('Erro no registro:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return ResponseHelper.unauthorized(res, 'Credenciais inválidas')
      }

      if (!user.isActive) {
        return ResponseHelper.unauthorized(res, 'Conta inativa')
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

      if (!isPasswordValid) {
        return ResponseHelper.unauthorized(res, 'Credenciais inválidas')
      }

      // Gerar tokens
      const { accessToken, refreshToken } = JwtHelper.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      // Remover hash da senha da resposta
      const { passwordHash, ...userWithoutPassword } = user

      return ResponseHelper.success(res, {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      }, 'Login realizado com sucesso')
    } catch (error) {
      console.error('Erro no login:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return ResponseHelper.unauthorized(res, 'Refresh token não fornecido')
      }

      // Verificar refresh token
      const payload = JwtHelper.verifyRefreshToken(refreshToken)

      // Buscar usuário
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

      if (!user || !user.isActive) {
        return ResponseHelper.unauthorized(res, 'Usuário não encontrado ou inativo')
      }

      // Gerar novos tokens
      const tokens = JwtHelper.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      return ResponseHelper.success(res, {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Token renovado com sucesso')
    } catch (error) {
      console.error('Erro na renovação do token:', error)
      return ResponseHelper.unauthorized(res, 'Refresh token inválido ou expirado')
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      // Em uma implementação mais robusta, você poderia adicionar o token a uma blacklist
      // Por enquanto, apenas retornamos sucesso
      return ResponseHelper.success(res, null, 'Logout realizado com sucesso')
    } catch (error) {
      console.error('Erro no logout:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res)
      }

      return ResponseHelper.success(res, req.user, 'Perfil obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter perfil:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res)
      }

      const { firstName, lastName, phone, avatarUrl } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          phone,
          avatarUrl,
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

      return ResponseHelper.updated(res, updatedUser, 'Perfil atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res)
      }

      const { currentPassword, newPassword } = req.body

      // Buscar usuário com senha
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!user) {
        return ResponseHelper.notFound(res, 'Usuário não encontrado')
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)

      if (!isCurrentPasswordValid) {
        return ResponseHelper.validationError(res, {
          currentPassword: ['Senha atual incorreta'],
        })
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      // Atualizar senha
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      })

      return ResponseHelper.success(res, null, 'Senha alterada com sucesso')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      })

      // Sempre retornar sucesso por segurança (não revelar se o email existe)
      if (!user) {
        return ResponseHelper.success(res, null, 'Se o email existir, você receberá instruções para redefinir sua senha')
      }

      // TODO: Implementar envio de email com token de reset
      // Por enquanto, apenas simular o envio
      console.log(`Reset password token would be sent to: ${email}`)

      return ResponseHelper.success(res, null, 'Se o email existir, você receberá instruções para redefinir sua senha')
    } catch (error) {
      console.error('Erro no esqueci minha senha:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword } = req.body

      // TODO: Implementar verificação do token de reset
      // Por enquanto, apenas retornar erro
      return ResponseHelper.error(res, 'Funcionalidade de reset de senha ainda não implementada', 501)
    } catch (error) {
      console.error('Erro no reset de senha:', error)
      return ResponseHelper.serverError(res)
    }
  }

  static async verifyToken(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res)
      }

      return ResponseHelper.success(res, {
        valid: true,
        user: req.user,
      }, 'Token válido')
    } catch (error) {
      console.error('Erro na verificação do token:', error)
      return ResponseHelper.unauthorized(res, 'Token inválido')
    }
  }
}

