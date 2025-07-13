import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ValidationError } from '../types'

export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    })

    if (error) {
      const errors: Record<string, string[]> = {}
      
      error.details.forEach((detail) => {
        const field = detail.path.join('.')
        if (!errors[field]) {
          errors[field] = []
        }
        errors[field].push(detail.message)
      })

      res.status(422).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      })
      return
    }

    // Substituir os dados validados e limpos
    req[property] = value
    next()
  }
}

export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body')
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query')
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params')

// Schema para validação de parâmetros UUID
export const uuidParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório',
  }),
})

// Schema para validação de paginação
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional(),
})

// Schema para validação de filtros de data
export const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
})

export default validate

