import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'
import { validateParams, validateQuery } from '../middleware/validation'
import Joi from 'joi'

const router = Router()

// Validation schemas
const uuidParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

const notificationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  unreadOnly: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
})

/**
 * @route   GET /api/notifications
 * @desc    Listar notificações do usuário
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(notificationQuerySchema),
  NotificationController.getUserNotifications
)

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put(
  '/:id/read',
  authenticate,
  validateParams(uuidParamsSchema),
  NotificationController.markAsRead
)

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Marcar todas as notificações como lidas
 * @access  Private
 */
router.put(
  '/mark-all-read',
  authenticate,
  NotificationController.markAllAsRead
)

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Excluir notificação
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  NotificationController.deleteNotification
)

/**
 * @route   GET /api/notifications/stats
 * @desc    Obter estatísticas de notificações
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  NotificationController.getNotificationStats
)

export default router

