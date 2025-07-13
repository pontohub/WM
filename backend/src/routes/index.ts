import { Router } from 'express'
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import companyRoutes from './companyRoutes'
import projectRoutes from './projectRoutes'
import taskRoutes from './taskRoutes'
import timeEntryRoutes from './timeEntryRoutes'
import contractRoutes from './contractRoutes'
import invoiceRoutes from './invoiceRoutes'
import clientPortalRoutes from './clientPortalRoutes'
import notificationRoutes from './notificationRoutes'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PontoHub Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API Info
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'PontoHub Portal API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      projects: '/api/projects',
      tasks: '/api/tasks',
      timeEntries: '/api/time-entries',
      contracts: '/api/contracts',
      invoices: '/api/invoices',
      clientPortal: '/api/client-portal',
      notifications: '/api/notifications',
      reports: '/api/reports',
    },
  })
})

// Auth routes
router.use('/auth', authRoutes)

// Main module routes
router.use('/users', userRoutes)
router.use('/companies', companyRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)
router.use('/time-entries', timeEntryRoutes)
router.use('/contracts', contractRoutes)
router.use('/invoices', invoiceRoutes)
router.use('/client-portal', clientPortalRoutes)
router.use('/notifications', notificationRoutes)

// TODO: Add other route modules here
// router.use('/reports', reportRoutes)

export default router

