import Joi from 'joi'

// User validation schemas
export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 50 caracteres',
      'any.required': 'Nome é obrigatório',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Sobrenome deve ter pelo menos 2 caracteres',
      'string.max': 'Sobrenome deve ter no máximo 50 caracteres',
      'any.required': 'Sobrenome é obrigatório',
    }),
    role: Joi.string().valid('ADMIN', 'EMPLOYEE', 'FREELANCER', 'CLIENT').optional(),
    phone: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Senha é obrigatória',
    }),
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().optional(),
    avatarUrl: Joi.string().uri().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Senha atual é obrigatória',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'any.required': 'Nova senha é obrigatória',
    }),
  }),
}

// Company validation schemas
export const companyValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome da empresa deve ter pelo menos 2 caracteres',
      'string.max': 'Nome da empresa deve ter no máximo 100 caracteres',
      'any.required': 'Nome da empresa é obrigatório',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
    phone: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    address: Joi.string().optional(),
    taxId: Joi.string().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    address: Joi.string().optional(),
    taxId: Joi.string().optional(),
    logoUrl: Joi.string().uri().optional(),
  }),
}

// Project validation schemas
export const projectValidation = {
  create: Joi.object({
    companyId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da empresa deve ser um UUID válido',
      'any.required': 'ID da empresa é obrigatório',
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome do projeto deve ter pelo menos 2 caracteres',
      'string.max': 'Nome do projeto deve ter no máximo 100 caracteres',
      'any.required': 'Nome do projeto é obrigatório',
    }),
    description: Joi.string().optional(),
    status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    budget: Joi.number().positive().optional(),
    hourlyRate: Joi.number().positive().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    budget: Joi.number().positive().optional(),
    hourlyRate: Joi.number().positive().optional(),
  }),
}

// Task validation schemas
export const taskValidation = {
  create: Joi.object({
    projectId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID do projeto deve ser um UUID válido',
      'any.required': 'ID do projeto é obrigatório',
    }),
    title: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Título da tarefa deve ter pelo menos 2 caracteres',
      'string.max': 'Título da tarefa deve ter no máximo 200 caracteres',
      'any.required': 'Título da tarefa é obrigatório',
    }),
    description: Joi.string().optional(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    assignedTo: Joi.string().uuid().optional(),
    estimatedHours: Joi.number().positive().optional(),
    dueDate: Joi.date().optional(),
    parentTaskId: Joi.string().uuid().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    assignedTo: Joi.string().uuid().optional(),
    estimatedHours: Joi.number().positive().optional(),
    dueDate: Joi.date().optional(),
  }),
}

// Time entry validation schemas
export const timeEntryValidation = {
  create: Joi.object({
    taskId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da tarefa deve ser um UUID válido',
      'any.required': 'ID da tarefa é obrigatório',
    }),
    description: Joi.string().optional(),
    startTime: Joi.date().required().messages({
      'any.required': 'Hora de início é obrigatória',
    }),
    endTime: Joi.date().greater(Joi.ref('startTime')).optional(),
    durationMinutes: Joi.number().positive().required().messages({
      'number.positive': 'Duração deve ser um número positivo',
      'any.required': 'Duração é obrigatória',
    }),
    hourlyRate: Joi.number().positive().required().messages({
      'number.positive': 'Taxa horária deve ser um número positivo',
      'any.required': 'Taxa horária é obrigatória',
    }),
    isBillable: Joi.boolean().optional(),
  }),

  update: Joi.object({
    description: Joi.string().optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    durationMinutes: Joi.number().positive().optional(),
    hourlyRate: Joi.number().positive().optional(),
    isBillable: Joi.boolean().optional(),
  }),
}

// Contract validation schemas
export const contractValidation = {
  create: Joi.object({
    companyId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da empresa deve ser um UUID válido',
      'any.required': 'ID da empresa é obrigatório',
    }),
    projectId: Joi.string().uuid().optional(),
    title: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Título do contrato deve ter pelo menos 2 caracteres',
      'string.max': 'Título do contrato deve ter no máximo 200 caracteres',
      'any.required': 'Título do contrato é obrigatório',
    }),
    content: Joi.string().required().messages({
      'any.required': 'Conteúdo do contrato é obrigatório',
    }),
    totalValue: Joi.number().positive().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    content: Joi.string().optional(),
    status: Joi.string().valid('DRAFT', 'SENT', 'SIGNED', 'CANCELLED').optional(),
    totalValue: Joi.number().positive().optional(),
  }),
}

// Invoice validation schemas
export const invoiceValidation = {
  create: Joi.object({
    companyId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da empresa deve ser um UUID válido',
      'any.required': 'ID da empresa é obrigatório',
    }),
    projectId: Joi.string().uuid().optional(),
    description: Joi.string().optional(),
    subtotal: Joi.number().positive().required().messages({
      'number.positive': 'Subtotal deve ser um número positivo',
      'any.required': 'Subtotal é obrigatório',
    }),
    taxRate: Joi.number().min(0).max(100).optional(),
    dueDate: Joi.date().required().messages({
      'any.required': 'Data de vencimento é obrigatória',
    }),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
      })
    ).min(1).required(),
  }),

  update: Joi.object({
    description: Joi.string().optional(),
    status: Joi.string().valid('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
    dueDate: Joi.date().optional(),
  }),
}

// Comment validation schemas
export const commentValidation = {
  create: Joi.object({
    taskId: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da tarefa deve ser um UUID válido',
      'any.required': 'ID da tarefa é obrigatório',
    }),
    content: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'Comentário não pode estar vazio',
      'string.max': 'Comentário deve ter no máximo 1000 caracteres',
      'any.required': 'Conteúdo do comentário é obrigatório',
    }),
  }),

  update: Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'Comentário não pode estar vazio',
      'string.max': 'Comentário deve ter no máximo 1000 caracteres',
      'any.required': 'Conteúdo do comentário é obrigatório',
    }),
  }),
}

// Query validation schemas
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  }),

  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  }),
}

