import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class ResponseHelper {
  static success<T>(res: Response, data?: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    }
    return res.status(statusCode).json(response)
  }

  static error(
    res: Response,
    message: string,
    statusCode = 400,
    errors?: Record<string, string[]>
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    }
    return res.status(statusCode).json(response)
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    },
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination,
    }
    return res.status(statusCode).json(response)
  }

  static created<T>(res: Response, data?: T, message = 'Criado com sucesso'): Response {
    return this.success(res, data, message, 201)
  }

  static updated<T>(res: Response, data?: T, message = 'Atualizado com sucesso'): Response {
    return this.success(res, data, message, 200)
  }

  static deleted(res: Response, message = 'Excluído com sucesso'): Response {
    return this.success(res, null, message, 200)
  }

  static notFound(res: Response, message = 'Recurso não encontrado'): Response {
    return this.error(res, message, 404)
  }

  static unauthorized(res: Response, message = 'Não autorizado'): Response {
    return this.error(res, message, 401)
  }

  static forbidden(res: Response, message = 'Acesso negado'): Response {
    return this.error(res, message, 403)
  }

  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message = 'Dados inválidos'
  ): Response {
    return this.error(res, message, 422, errors)
  }

  static serverError(res: Response, message = 'Erro interno do servidor'): Response {
    return this.error(res, message, 500)
  }
}

export default ResponseHelper

