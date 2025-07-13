import { Router } from 'express'
import { ClientPortalController } from '../controllers/clientPortalController'
import { authenticate, authorize } from '../middleware/auth'
import { validateParams, validateQuery } from '../middleware/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const uuidParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional(),
  companyId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
})

const reportQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  companyId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
})

/**
 * @route   GET /api/client-portal/dashboard
 * @desc    Obter dashboard do cliente
 * @access  Private (Client only)
 */
router.get(
  '/dashboard',
  authenticate,
  authorize(UserRole.CLIENT),
  ClientPortalController.getClientDashboard
)

/**
 * @route   GET /api/client-portal/projects
 * @desc    Listar projetos do cliente
 * @access  Private (Client only)
 */
router.get(
  '/projects',
  authenticate,
  authorize(UserRole.CLIENT),
  validateQuery(paginationQuerySchema),
  ClientPortalController.getClientProjects
)

/**
 * @route   GET /api/client-portal/projects/:id
 * @desc    Obter projeto específico do cliente
 * @access  Private (Client only)
 */
router.get(
  '/projects/:id',
  authenticate,
  authorize(UserRole.CLIENT),
  validateParams(uuidParamsSchema),
  ClientPortalController.getClientProject
)

/**
 * @route   GET /api/client-portal/contracts
 * @desc    Listar contratos do cliente
 * @access  Private (Client only)
 */
router.get(
  '/contracts',
  authenticate,
  authorize(UserRole.CLIENT),
  validateQuery(paginationQuerySchema),
  ClientPortalController.getClientContracts
)

/**
 * @route   GET /api/client-portal/invoices
 * @desc    Listar faturas do cliente
 * @access  Private (Client only)
 */
router.get(
  '/invoices',
  authenticate,
  authorize(UserRole.CLIENT),
  validateQuery(paginationQuerySchema),
  ClientPortalController.getClientInvoices
)

/**
 * @route   GET /api/client-portal/invoices/:id
 * @desc    Obter fatura específica do cliente
 * @access  Private (Client only)
 */
router.get(
  '/invoices/:id',
  authenticate,
  authorize(UserRole.CLIENT),
  validateParams(uuidParamsSchema),
  ClientPortalController.getClientInvoice
)

/**
 * @route   GET /api/client-portal/activity-report
 * @desc    Obter relatório de atividades do cliente
 * @access  Private (Client only)
 */
router.get(
  '/activity-report',
  authenticate,
  authorize(UserRole.CLIENT),
  validateQuery(reportQuerySchema),
  ClientPortalController.getClientActivityReport
)

export default router

