import { Router } from 'express'
import { CompanyController } from '../controllers/companyController'
import { authenticate, authorize, authorizeCompanyAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { companyValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const companyQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
})

const addUserSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid('ADMIN', 'EMPLOYEE', 'FREELANCER', 'CLIENT').optional(),
})

const userParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
})

/**
 * @route   GET /api/companies
 * @desc    Obter lista de empresas
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(companyQuerySchema),
  CompanyController.getCompanies
)

/**
 * @route   GET /api/companies/:id
 * @desc    Obter empresa por ID
 * @access  Private (Company Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeCompanyAccess,
  CompanyController.getCompanyById
)

/**
 * @route   POST /api/companies
 * @desc    Criar nova empresa
 * @access  Private (Admin/Employee)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateBody(companyValidation.create),
  CompanyController.createCompany
)

/**
 * @route   PUT /api/companies/:id
 * @desc    Atualizar empresa
 * @access  Private (Admin/Company Access)
 */
router.put(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  validateBody(companyValidation.update),
  authorizeCompanyAccess,
  CompanyController.updateCompany
)

/**
 * @route   DELETE /api/companies/:id
 * @desc    Excluir empresa
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  CompanyController.deleteCompany
)

/**
 * @route   POST /api/companies/:id/users
 * @desc    Adicionar usuário à empresa
 * @access  Private (Admin/Employee)
 */
router.post(
  '/:id/users',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(addUserSchema),
  CompanyController.addUserToCompany
)

/**
 * @route   DELETE /api/companies/:id/users/:userId
 * @desc    Remover usuário da empresa
 * @access  Private (Admin/Employee)
 */
router.delete(
  '/:id/users/:userId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(userParamsSchema),
  CompanyController.removeUserFromCompany
)

/**
 * @route   GET /api/companies/:id/stats
 * @desc    Obter estatísticas da empresa
 * @access  Private (Company Access)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeCompanyAccess,
  CompanyController.getCompanyStats
)

export default router

