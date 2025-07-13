import { Response } from 'express'
import { prisma } from '../lib/database'
import { ResponseHelper } from '../utils/response'
import { AuthenticatedRequest } from '../types'
import { UserRole } from '@prisma/client'

export class NotificationController {
  // Listar notificações do usuário
  static async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id
      const { 
        page = 1, 
        limit = 20, 
        unreadOnly = false,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {
        userId,
      }

      if (unreadOnly === 'true') {
        where.isRead = false
      }

      // Get notifications with pagination
      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ 
          where: { userId, isRead: false } 
        }),
      ])

      const totalPages = Math.ceil(total / take)

      const response = {
        notifications,
        pagination: {
          page: Number(page),
          limit: take,
          total,
          totalPages,
        },
        unreadCount,
      }

      return ResponseHelper.success(res, response, 'Notificações obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter notificações:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Marcar notificação como lida
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      // Verificar se a notificação existe e pertence ao usuário
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      })

      if (!notification) {
        return ResponseHelper.notFound(res, 'Notificação não encontrada')
      }

      // Marcar como lida
      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { 
          isRead: true,
          readAt: new Date(),
        },
      })

      return ResponseHelper.updated(res, updatedNotification, 'Notificação marcada como lida')
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Marcar todas as notificações como lidas
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id

      // Marcar todas as notificações não lidas como lidas
      const result = await prisma.notification.updateMany({
        where: { 
          userId, 
          isRead: false 
        },
        data: { 
          isRead: true,
          readAt: new Date(),
        },
      })

      return ResponseHelper.success(
        res, 
        { updatedCount: result.count }, 
        `${result.count} notificações marcadas como lidas`
      )
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Excluir notificação
  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      // Verificar se a notificação existe e pertence ao usuário
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      })

      if (!notification) {
        return ResponseHelper.notFound(res, 'Notificação não encontrada')
      }

      // Excluir notificação
      await prisma.notification.delete({
        where: { id },
      })

      return ResponseHelper.deleted(res, 'Notificação excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Obter estatísticas de notificações
  static async getNotificationStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id

      const [total, unread, today] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        prisma.notification.count({ 
          where: { 
            userId, 
            createdAt: { 
              gte: new Date(new Date().setHours(0, 0, 0, 0)) 
            } 
          } 
        }),
      ])

      const stats = {
        total,
        unread,
        read: total - unread,
        today,
        readPercentage: total > 0 ? Math.round(((total - unread) / total) * 100) : 0,
      }

      return ResponseHelper.success(res, stats, 'Estatísticas de notificações obtidas com sucesso')
    } catch (error) {
      console.error('Erro ao obter estatísticas de notificações:', error)
      return ResponseHelper.serverError(res)
    }
  }

  // Criar notificação (uso interno)
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    relatedId?: string,
    relatedType?: string
  ): Promise<any> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          relatedId,
          relatedType,
        },
      })

      return notification
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }

  // Criar notificação para múltiplos usuários
  static async createBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'info',
    relatedId?: string,
    relatedType?: string
  ): Promise<any> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type,
        relatedId,
        relatedType,
      }))

      const result = await prisma.notification.createMany({
        data: notifications,
      })

      return result
    } catch (error) {
      console.error('Erro ao criar notificações em lote:', error)
      throw error
    }
  }

  // Notificar sobre nova tarefa atribuída
  static async notifyTaskAssigned(taskId: string, assigneeId: string, assignedBy: string): Promise<void> {
    try {
      const [task, assigner] = await Promise.all([
        prisma.task.findUnique({
          where: { id: taskId },
          include: {
            project: {
              select: { name: true },
            },
          },
        }),
        prisma.user.findUnique({
          where: { id: assignedBy },
          select: { firstName: true, lastName: true },
        }),
      ])

      if (task && assigner) {
        await NotificationController.createNotification(
          assigneeId,
          'Nova tarefa atribuída',
          `${assigner.firstName} ${assigner.lastName} atribuiu a tarefa "${task.title}" do projeto "${task.project.name}" para você.`,
          'task',
          taskId,
          'task'
        )
      }
    } catch (error) {
      console.error('Erro ao notificar atribuição de tarefa:', error)
    }
  }

  // Notificar sobre conclusão de tarefa
  static async notifyTaskCompleted(taskId: string, completedBy: string): Promise<void> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            include: {
              company: {
                include: {
                  companyUsers: {
                    where: {
                      user: {
                        role: { in: [UserRole.ADMIN, UserRole.EMPLOYEE] },
                      },
                    },
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          creator: {
            select: { firstName: true, lastName: true },
          },
        },
      })

      if (task) {
        const completer = await prisma.user.findUnique({
          where: { id: completedBy },
          select: { firstName: true, lastName: true },
        })

        if (completer) {
          // Notificar membros da empresa (exceto quem completou)
          const userIds = task.project.company.companyUsers
            .filter(cu => cu.userId !== completedBy)
            .map(cu => cu.userId)

          if (userIds.length > 0) {
            await NotificationController.createBulkNotifications(
              userIds,
              'Tarefa concluída',
              `${completer.firstName} ${completer.lastName} concluiu a tarefa "${task.title}" do projeto "${task.project.name}".`,
              'success',
              taskId,
              'task'
            )
          }
        }
      }
    } catch (error) {
      console.error('Erro ao notificar conclusão de tarefa:', error)
    }
  }

  // Notificar sobre novo comentário
  static async notifyNewComment(commentId: string, taskId: string, authorId: string): Promise<void> {
    try {
      const [comment, task] = await Promise.all([
        prisma.comment.findUnique({
          where: { id: commentId },
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
        prisma.task.findUnique({
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
            assignee: true,
            creator: true,
          },
        }),
      ])

      if (comment && task) {
        // Notificar pessoas envolvidas na tarefa (exceto o autor do comentário)
        const involvedUserIds = new Set<string>()
        
        if (task.assignedTo && task.assignedTo !== authorId) {
          involvedUserIds.add(task.assignedTo)
        }
        
        if (task.createdBy !== authorId) {
          involvedUserIds.add(task.createdBy)
        }

        // Adicionar outros membros da empresa que comentaram nesta tarefa
        const otherCommenters = await prisma.comment.findMany({
          where: { 
            taskId,
            userId: { not: authorId },
          },
          select: { userId: true },
          distinct: ['userId'],
        })

        otherCommenters.forEach(c => involvedUserIds.add(c.userId))

        if (involvedUserIds.size > 0) {
          await NotificationController.createBulkNotifications(
            Array.from(involvedUserIds),
            'Novo comentário',
            `${comment.user.firstName} ${comment.user.lastName} comentou na tarefa "${task.title}".`,
            'comment',
            taskId,
            'task'
          )
        }
      }
    } catch (error) {
      console.error('Erro ao notificar novo comentário:', error)
    }
  }

  // Notificar sobre nova fatura
  static async notifyNewInvoice(invoiceId: string, companyId: string): Promise<void> {
    try {
      const [invoice, companyUsers] = await Promise.all([
        prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            company: {
              select: { name: true },
            },
          },
        }),
        prisma.companyUser.findMany({
          where: { companyId },
          include: {
            user: {
              select: { role: true },
            },
          },
        }),
      ])

      if (invoice) {
        // Notificar clientes da empresa
        const clientIds = companyUsers
          .filter(cu => cu.user.role === UserRole.CLIENT)
          .map(cu => cu.userId)

        if (clientIds.length > 0) {
          await NotificationController.createBulkNotifications(
            clientIds,
            'Nova fatura disponível',
            `Uma nova fatura (${invoice.invoiceNumber}) foi gerada para ${invoice.company.name}.`,
            'invoice',
            invoiceId,
            'invoice'
          )
        }
      }
    } catch (error) {
      console.error('Erro ao notificar nova fatura:', error)
    }
  }

  // Notificar sobre contrato assinado
  static async notifyContractSigned(contractId: string, companyId: string): Promise<void> {
    try {
      const [contract, companyUsers] = await Promise.all([
        prisma.contract.findUnique({
          where: { id: contractId },
          include: {
            company: {
              select: { name: true },
            },
          },
        }),
        prisma.companyUser.findMany({
          where: { companyId },
          include: {
            user: {
              select: { role: true },
            },
          },
        }),
      ])

      if (contract) {
        // Notificar todos os membros da empresa
        const userIds = companyUsers.map(cu => cu.userId)

        if (userIds.length > 0) {
          await NotificationController.createBulkNotifications(
            userIds,
            'Contrato assinado',
            `O contrato "${contract.title}" foi assinado com sucesso.`,
            'success',
            contractId,
            'contract'
          )
        }
      }
    } catch (error) {
      console.error('Erro ao notificar contrato assinado:', error)
    }
  }
}

