# PontoHub Portal - Documentação da API

## Visão Geral

A API do PontoHub Portal é uma API RESTful construída com Node.js, Express e TypeScript que fornece funcionalidades completas para gestão de projetos, incluindo autenticação, gestão de usuários, empresas, projetos, tarefas, time tracking, contratos, faturamento e notificações.

### Informações Básicas

- **URL Base**: `http://localhost:3001/api`
- **Versão**: 1.0.0
- **Protocolo**: HTTP/HTTPS
- **Formato de Dados**: JSON
- **Autenticação**: JWT (JSON Web Tokens)

### Características Principais

- **Autenticação JWT** com refresh tokens
- **Controle de acesso baseado em roles** (RBAC)
- **Validação de dados** com Joi
- **Rate limiting** para proteção contra spam
- **Paginação** em listagens
- **Filtros e busca** avançados
- **Health checks** para monitoramento

## Autenticação

### Tipos de Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Existem dois tipos de tokens:

1. **Access Token**: Token de curta duração (24h) usado para autenticar requisições
2. **Refresh Token**: Token de longa duração (7d) usado para renovar access tokens

### Headers de Autenticação

Para rotas protegidas, inclua o access token no header:

```
Authorization: Bearer <access_token>
```

### Roles de Usuário

- **ADMIN**: Acesso total ao sistema
- **EMPLOYEE**: Acesso a recursos da empresa
- **FREELANCER**: Acesso limitado a projetos atribuídos
- **CLIENT**: Acesso apenas ao portal do cliente

## Endpoints da API

### Autenticação (`/api/auth`)

#### POST /api/auth/register
Registra um novo usuário no sistema.

**Parâmetros do Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "ADMIN|EMPLOYEE|FREELANCER|CLIENT"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

#### POST /api/auth/login
Autentica um usuário existente.

**Parâmetros do Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

#### POST /api/auth/refresh
Renova o access token usando o refresh token.

**Parâmetros do Body:**
```json
{
  "refreshToken": "string"
}
```

#### POST /api/auth/logout
Faz logout do usuário e invalida os tokens.

**Headers:** `Authorization: Bearer <access_token>`

### Usuários (`/api/users`)

#### GET /api/users
Lista usuários com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máx: 100)
- `search` (string): Busca por nome ou email
- `role` (string): Filtrar por role
- `isActive` (boolean): Filtrar por status ativo
- `sortBy` (string): Campo para ordenação
- `sortOrder` (string): Ordem (asc/desc)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string",
      "isActive": true,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/users/:id
Obtém detalhes de um usuário específico.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/users
Cria um novo usuário.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN

#### PUT /api/users/:id
Atualiza um usuário existente.

**Headers:** `Authorization: Bearer <access_token>`

#### DELETE /api/users/:id
Desativa um usuário.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN

### Empresas (`/api/companies`)

#### GET /api/companies
Lista empresas com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder`

#### POST /api/companies
Cria uma nova empresa.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN, EMPLOYEE

**Parâmetros do Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "website": "string",
  "address": "string",
  "taxId": "string"
}
```

### Projetos (`/api/projects`)

#### GET /api/projects
Lista projetos com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `status` (string): Filtrar por status
- `companyId` (uuid): Filtrar por empresa

#### POST /api/projects
Cria um novo projeto.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN, EMPLOYEE

**Parâmetros do Body:**
```json
{
  "name": "string",
  "description": "string",
  "companyId": "uuid",
  "status": "PLANNING|ACTIVE|ON_HOLD|COMPLETED|CANCELLED",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "budget": "number",
  "hourlyRate": "number",
  "startDate": "date",
  "endDate": "date"
}
```

### Tarefas (`/api/tasks`)

#### GET /api/tasks
Lista tarefas com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `status` (string): Filtrar por status
- `priority` (string): Filtrar por prioridade
- `projectId` (uuid): Filtrar por projeto
- `assignedTo` (uuid): Filtrar por responsável

#### POST /api/tasks
Cria uma nova tarefa.

**Headers:** `Authorization: Bearer <access_token>`

**Parâmetros do Body:**
```json
{
  "title": "string",
  "description": "string",
  "projectId": "uuid",
  "assignedTo": "uuid",
  "parentTaskId": "uuid",
  "status": "TODO|IN_PROGRESS|REVIEW|COMPLETED|CANCELLED",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "estimatedHours": "number",
  "dueDate": "date"
}
```

### Time Tracking (`/api/time-entries`)

#### GET /api/time-entries
Lista registros de tempo com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/time-entries
Cria um registro de tempo manual.

**Headers:** `Authorization: Bearer <access_token>`

**Parâmetros do Body:**
```json
{
  "taskId": "uuid",
  "description": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "durationMinutes": "number",
  "isBillable": "boolean",
  "hourlyRate": "number"
}
```

#### POST /api/time-entries/start-timer
Inicia um timer para uma tarefa.

#### PUT /api/time-entries/:id/stop-timer
Para um timer ativo.

### Contratos (`/api/contracts`)

#### GET /api/contracts
Lista contratos com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/contracts
Cria um novo contrato.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN, EMPLOYEE

**Parâmetros do Body:**
```json
{
  "companyId": "uuid",
  "projectId": "uuid",
  "title": "string",
  "content": "string",
  "totalValue": "number",
  "status": "DRAFT|SENT|SIGNED|CANCELLED"
}
```

#### PUT /api/contracts/:id/sign
Assina um contrato.

### Faturas (`/api/invoices`)

#### GET /api/invoices
Lista faturas com paginação e filtros.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/invoices
Cria uma nova fatura.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** ADMIN, EMPLOYEE

**Parâmetros do Body:**
```json
{
  "companyId": "uuid",
  "projectId": "uuid",
  "invoiceNumber": "string",
  "description": "string",
  "dueDate": "date",
  "taxRate": "number",
  "items": [
    {
      "description": "string",
      "quantity": "number",
      "unitPrice": "number"
    }
  ]
}
```

### Portal do Cliente (`/api/client-portal`)

#### GET /api/client-portal/dashboard
Obtém dashboard do cliente.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** CLIENT

#### GET /api/client-portal/projects
Lista projetos do cliente.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** CLIENT

#### GET /api/client-portal/contracts
Lista contratos do cliente.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** CLIENT

#### GET /api/client-portal/invoices
Lista faturas do cliente.

**Headers:** `Authorization: Bearer <access_token>`
**Permissões:** CLIENT

### Notificações (`/api/notifications`)

#### GET /api/notifications
Lista notificações do usuário.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`
- `unreadOnly` (boolean): Apenas não lidas

#### PUT /api/notifications/:id/read
Marca notificação como lida.

#### PUT /api/notifications/mark-all-read
Marca todas as notificações como lidas.

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token inválido ou ausente
- **403 Forbidden**: Sem permissão para acessar o recurso
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito (ex: email já existe)
- **422 Unprocessable Entity**: Erro de validação
- **429 Too Many Requests**: Rate limit excedido
- **500 Internal Server Error**: Erro interno do servidor

## Estrutura de Resposta

### Resposta de Sucesso
```json
{
  "success": true,
  "message": "string",
  "data": "any"
}
```

### Resposta de Erro
```json
{
  "success": false,
  "message": "string",
  "error": {
    "code": "string",
    "details": "any"
  }
}
```

### Resposta Paginada
```json
{
  "success": true,
  "message": "string",
  "data": "array",
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

## Rate Limiting

A API implementa rate limiting para proteger contra spam e ataques:

- **Rotas gerais**: 10 requisições por segundo
- **Rotas de autenticação**: 5 requisições por minuto
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite de requisições
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## Exemplos de Uso

### Autenticação Completa

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data.tokens;

// 2. Usar token em requisições
const projectsResponse = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Renovar token quando necessário
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});
```

### Criação de Projeto

```javascript
const projectData = {
  name: 'Novo Projeto',
  description: 'Descrição do projeto',
  companyId: 'company-uuid',
  status: 'PLANNING',
  priority: 'HIGH',
  budget: 10000,
  hourlyRate: 50,
  startDate: '2024-01-01',
  endDate: '2024-06-30'
};

const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(projectData)
});
```

### Time Tracking

```javascript
// Iniciar timer
const startTimer = await fetch('/api/time-entries/start-timer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    taskId: 'task-uuid',
    description: 'Trabalhando na feature X'
  })
});

// Parar timer
const stopTimer = await fetch(`/api/time-entries/${entryId}/stop-timer`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Webhooks (Futuro)

O sistema está preparado para implementar webhooks para notificar sistemas externos sobre eventos importantes:

- Criação/atualização de projetos
- Conclusão de tarefas
- Assinatura de contratos
- Pagamento de faturas

## Versionamento

A API segue versionamento semântico:
- **Major**: Mudanças incompatíveis
- **Minor**: Novas funcionalidades compatíveis
- **Patch**: Correções de bugs

Versões futuras serão acessíveis via header ou URL:
```
Accept: application/vnd.pontohub.v2+json
```

## Suporte e Contato

Para dúvidas sobre a API:
- **Email**: api-support@pontohub.com
- **Documentação**: https://docs.pontohub.com
- **Status**: https://status.pontohub.com

