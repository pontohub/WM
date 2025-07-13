import { Router } from 'express'
import { UserController } from '../controllers/userController'
import { authenticate, authorize, authorizeOwnerOrAdmin } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { userValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE', 'FREELANCER', 'CLIENT').optional(),
  phone: Joi.string().optional(),
})

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE', 'FREELANCER', 'CLIENT').optional(),
  phone: Joi.string().optional(),
  avatarUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional(),
})

const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
})

const userQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE', 'FREELANCER', 'CLIENT').optional(),
})

/**
 * @route   GET /api/users
 * @desc    Obter lista de usuários
 * @access  Private (Admin/Employee)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateQuery(userQuerySchema),
  UserController.getUsers
)

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private (Owner/Admin)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeOwnerOrAdmin('id'),
  UserController.getUserById
)

/**
 * @route   POST /api/users
 * @desc    Criar novo usuário
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateBody(createUserSchema),
  UserController.createUser
)

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar usuário
 * @access  Private (Owner/Admin)
 */
router.put(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  validateBody(updateUserSchema),
  authorizeOwnerOrAdmin('id'),
  UserController.updateUser
)

/**
 * @route   DELETE /api/users/:id
 * @desc    Excluir usuário
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  UserController.deleteUser
)

/**
 * @route   PUT /api/users/:id/password
 * @desc    Alterar senha do usuário
 * @access  Private (Admin)
 */
router.put(
  '/:id/password',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  validateBody(changePasswordSchema),
  UserController.changeUserPassword
)

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obter estatísticas do usuário
 * @access  Private (Owner/Admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeOwnerOrAdmin('id'),
  UserController.getUserStats
)

export default router

