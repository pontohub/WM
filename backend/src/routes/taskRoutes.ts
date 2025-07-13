import { Router } from 'express'
import { TaskController } from '../controllers/taskController'
import { authenticate, authorize, authorizeTaskAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { taskValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const taskQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  assignedTo: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
})

/**
 * @route   GET /api/tasks
 * @desc    Obter lista de tarefas
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(taskQuerySchema),
  TaskController.getTasks
)

/**
 * @route   GET /api/tasks/:id
 * @desc    Obter tarefa por ID
 * @access  Private (Task Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeTaskAccess,
  TaskController.getTaskById
)

/**
 * @route   POST /api/tasks
 * @desc    Criar nova tarefa
 * @access  Private (Admin/Employee)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateBody(taskValidation.create),
  TaskController.createTask
)

/**
 * @route   PUT /api/tasks/:id
 * @desc    Atualizar tarefa
 * @access  Private (Admin/Employee with Task Access)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(taskValidation.update),
  authorizeTaskAccess,
  TaskController.updateTask
)

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Excluir tarefa
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  TaskController.deleteTask
)

/**
 * @route   GET /api/tasks/:id/stats
 * @desc    Obter estatísticas da tarefa
 * @access  Private (Task Access)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeTaskAccess,
  TaskController.getTaskStats
)

export default router

