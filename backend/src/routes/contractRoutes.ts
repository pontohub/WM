import { Router } from 'express'
import { ContractController } from '../controllers/contractController'
import { authenticate, authorize, authorizeContractAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { contractValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const contractQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'SENT', 'SIGNED', 'CANCELLED').optional(),
  companyId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
})

/**
 * @route   GET /api/contracts
 * @desc    Obter lista de contratos
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(contractQuerySchema),
  ContractController.getContracts
)

/**
 * @route   GET /api/contracts/:id
 * @desc    Obter contrato por ID
 * @access  Private (Contract Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeContractAccess,
  ContractController.getContractById
)

/**
 * @route   POST /api/contracts
 * @desc    Criar novo contrato
 * @access  Private (Admin/Employee)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateBody(contractValidation.create),
  ContractController.createContract
)

/**
 * @route   PUT /api/contracts/:id
 * @desc    Atualizar contrato
 * @access  Private (Admin/Employee with Contract Access)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(contractValidation.update),
  authorizeContractAccess,
  ContractController.updateContract
)

/**
 * @route   PUT /api/contracts/:id/sign
 * @desc    Assinar contrato
 * @access  Private (Admin/Employee with Contract Access)
 */
router.put(
  '/:id/sign',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  authorizeContractAccess,
  ContractController.signContract
)

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Excluir contrato
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  ContractController.deleteContract
)

/**
 * @route   GET /api/contracts/:id/stats
 * @desc    Obter estatísticas do contrato
 * @access  Private (Contract Access)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeContractAccess,
  ContractController.getContractStats
)

export default router

