import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { userValidation } from '../utils/validation'

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post(
  '/register',
  validateBody(userValidation.register),
  AuthController.register
)

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
router.post(
  '/login',
  validateBody(userValidation.login),
  AuthController.login
)

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acesso
 * @access  Public
 */
router.post('/refresh', AuthController.refreshToken)

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout)

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile)

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário logado
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validateBody(userValidation.update),
  AuthController.updateProfile
)

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar senha do usuário logado
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  validateBody(userValidation.changePassword),
  AuthController.changePassword
)

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar reset de senha
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword)

/**
 * @route   POST /api/auth/reset-password
 * @desc    Redefinir senha com token
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword)

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar se o token é válido
 * @access  Private
 */
router.get('/verify', authenticate, AuthController.verifyToken)

export default router

