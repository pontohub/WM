import { Router } from 'express'
import { ProjectController } from '../controllers/projectController'
import { authenticate, authorize, authorizeProjectAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { projectValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const projectQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
  status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED').optional(),
  companyId: Joi.string().uuid().optional(),
})

/**
 * @route   GET /api/projects
 * @desc    Obter lista de projetos
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(projectQuerySchema),
  ProjectController.getProjects
)

/**
 * @route   GET /api/projects/:id
 * @desc    Obter projeto por ID
 * @access  Private (Project Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeProjectAccess,
  ProjectController.getProjectById
)

/**
 * @route   POST /api/projects
 * @desc    Criar novo projeto
 * @access  Private (Admin/Employee)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateBody(projectValidation.create),
  ProjectController.createProject
)

/**
 * @route   PUT /api/projects/:id
 * @desc    Atualizar projeto
 * @access  Private (Admin/Employee with Project Access)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(projectValidation.update),
  authorizeProjectAccess,
  ProjectController.updateProject
)

/**
 * @route   DELETE /api/projects/:id
 * @desc    Excluir projeto
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  ProjectController.deleteProject
)

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Obter estatísticas do projeto
 * @access  Private (Project Access)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeProjectAccess,
  ProjectController.getProjectStats
)

export default router

