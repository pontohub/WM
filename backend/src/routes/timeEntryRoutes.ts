import { Router } from 'express'
import { TimeEntryController } from '../controllers/timeEntryController'
import { authenticate, authorize, authorizeTimeEntryAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { timeEntryValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const timeEntryQuerySchema = paginationSchema.keys({
  userId: Joi.string().uuid().optional(),
  taskId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  isBillable: Joi.boolean().optional(),
  isApproved: Joi.boolean().optional(),
})

const approveTimeEntrySchema = Joi.object({
  isApproved: Joi.boolean().required(),
})

const startTimerSchema = Joi.object({
  taskId: Joi.string().uuid().required(),
  description: Joi.string().optional(),
})

/**
 * @route   GET /api/time-entries
 * @desc    Obter lista de registros de tempo
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(timeEntryQuerySchema),
  TimeEntryController.getTimeEntries
)

/**
 * @route   GET /api/time-entries/active-timer
 * @desc    Obter timer ativo do usuário
 * @access  Private
 */
router.get(
  '/active-timer',
  authenticate,
  TimeEntryController.getActiveTimer
)

/**
 * @route   GET /api/time-entries/:id
 * @desc    Obter registro de tempo por ID
 * @access  Private (Time Entry Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeTimeEntryAccess,
  TimeEntryController.getTimeEntryById
)

/**
 * @route   POST /api/time-entries
 * @desc    Criar novo registro de tempo
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateBody(timeEntryValidation.create),
  TimeEntryController.createTimeEntry
)

/**
 * @route   POST /api/time-entries/start-timer
 * @desc    Iniciar timer
 * @access  Private
 */
router.post(
  '/start-timer',
  authenticate,
  validateBody(startTimerSchema),
  TimeEntryController.startTimer
)

/**
 * @route   PUT /api/time-entries/:id
 * @desc    Atualizar registro de tempo
 * @access  Private (Owner/Admin/Employee with access)
 */
router.put(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  validateBody(timeEntryValidation.update),
  authorizeTimeEntryAccess,
  TimeEntryController.updateTimeEntry
)

/**
 * @route   PUT /api/time-entries/:id/stop-timer
 * @desc    Parar timer
 * @access  Private (Owner)
 */
router.put(
  '/:id/stop-timer',
  authenticate,
  validateParams(uuidParamsSchema),
  TimeEntryController.stopTimer
)

/**
 * @route   PUT /api/time-entries/:id/approve
 * @desc    Aprovar/desaprovar registro de tempo
 * @access  Private (Admin/Employee)
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(approveTimeEntrySchema),
  TimeEntryController.approveTimeEntry
)

/**
 * @route   DELETE /api/time-entries/:id
 * @desc    Excluir registro de tempo
 * @access  Private (Owner/Admin with access)
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeTimeEntryAccess,
  TimeEntryController.deleteTimeEntry
)

export default router

