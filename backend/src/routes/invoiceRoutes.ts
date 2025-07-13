import { Router } from 'express'
import { InvoiceController } from '../controllers/invoiceController'
import { authenticate, authorize, authorizeInvoiceAccess } from '../middleware/auth'
import { validateBody, validateParams, validateQuery, uuidParamsSchema, paginationSchema } from '../middleware/validation'
import { invoiceValidation } from '../utils/validation'
import { UserRole } from '@prisma/client'
import Joi from 'joi'

const router = Router()

// Validation schemas
const invoiceQuerySchema = paginationSchema.keys({
  search: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
  companyId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
  contractId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
})

const markAsPaidSchema = Joi.object({
  paidAmount: Joi.number().positive().optional(),
  paymentDate: Joi.date().iso().optional(),
  paymentMethod: Joi.string().optional(),
  notes: Joi.string().optional(),
})

/**
 * @route   GET /api/invoices
 * @desc    Obter lista de faturas
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(invoiceQuerySchema),
  InvoiceController.getInvoices
)

/**
 * @route   GET /api/invoices/:id
 * @desc    Obter fatura por ID
 * @access  Private (Invoice Access)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamsSchema),
  authorizeInvoiceAccess,
  InvoiceController.getInvoiceById
)

/**
 * @route   POST /api/invoices
 * @desc    Criar nova fatura
 * @access  Private (Admin/Employee)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateBody(invoiceValidation.create),
  InvoiceController.createInvoice
)

/**
 * @route   PUT /api/invoices/:id
 * @desc    Atualizar fatura
 * @access  Private (Admin/Employee with Invoice Access)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(invoiceValidation.update),
  authorizeInvoiceAccess,
  InvoiceController.updateInvoice
)

/**
 * @route   PUT /api/invoices/:id/mark-as-paid
 * @desc    Marcar fatura como paga
 * @access  Private (Admin/Employee with Invoice Access)
 */
router.put(
  '/:id/mark-as-paid',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYEE),
  validateParams(uuidParamsSchema),
  validateBody(markAsPaidSchema),
  authorizeInvoiceAccess,
  InvoiceController.markAsPaid
)

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Excluir fatura
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(uuidParamsSchema),
  InvoiceController.deleteInvoice
)

export default router

