# Guia de Instalação - PontoHub Portal

Este guia fornece instruções detalhadas para instalar e configurar o PontoHub Portal em diferentes ambientes.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação com Docker (Recomendado)](#instalação-com-docker-recomendado)
3. [Instalação Manual](#instalação-manual)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Configuração de Ambiente](#configuração-de-ambiente)
6. [Verificação da Instalação](#verificação-da-instalação)
7. [Solução de Problemas](#solução-de-problemas)

## Pré-requisitos

### Para Instalação com Docker

- **Docker**: Versão 20.10 ou superior
- **Docker Compose**: Versão 2.0 ou superior
- **Git**: Para clonar o repositório
- **Sistema Operacional**: Linux, macOS ou Windows com WSL2

### Para Instalação Manual

- **Node.js**: Versão 18 ou superior
- **npm**: Versão 8 ou superior (incluído com Node.js)
- **PostgreSQL**: Versão 13 ou superior
- **Redis**: Versão 6 ou superior (opcional, para cache)
- **Git**: Para clonar o repositório

### Recursos de Sistema Recomendados

#### Desenvolvimento
- **CPU**: 2 cores
- **RAM**: 4GB
- **Armazenamento**: 10GB livres

#### Produção
- **CPU**: 4 cores
- **RAM**: 8GB
- **Armazenamento**: 50GB livres
- **Rede**: Conexão estável com internet

## Instalação com Docker (Recomendado)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/pontohub-portal.git
cd pontohub-portal
```

### 2. Configurar Variáveis de Ambiente

#### Backend
```bash
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://pontohub_user:pontohub_password@postgres:5432/pontohub_portal"

# Redis
REDIS_URL="redis://redis:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="PontoHub Portal <noreply@pontohub.com>"
```

#### Frontend
```bash
cp frontend/.env.example frontend/.env.local
```

Edite o arquivo `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="PontoHub Portal"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 3. Executar o Deploy

#### Ambiente de Desenvolvimento
```bash
./scripts/deploy.sh development
```

#### Ambiente de Produção
```bash
./scripts/deploy.sh production
```

### 4. Verificar a Instalação

Após o deploy, verifique se os serviços estão funcionando:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## Instalação Manual

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/pontohub-portal.git
cd pontohub-portal
```

### 2. Configurar o Banco de Dados

#### Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (com Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Baixe e instale do site oficial: https://www.postgresql.org/download/windows/

#### Criar Banco de Dados

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE pontohub_portal;
CREATE USER pontohub_user WITH PASSWORD 'pontohub_password';
GRANT ALL PRIVILEGES ON DATABASE pontohub_portal TO pontohub_user;
\q
```

### 3. Configurar Redis (Opcional)

#### Instalar Redis

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

**macOS (com Homebrew):**
```bash
brew install redis
brew services start redis
```

### 4. Configurar o Backend

```bash
cd backend
npm install
```

#### Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
NODE_ENV="development"
PORT="3001"
DATABASE_URL="postgresql://pontohub_user:pontohub_password@localhost:5432/pontohub_portal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

#### Executar Migrações
```bash
npx prisma migrate dev
npx prisma db seed
```

#### Iniciar o Servidor
```bash
npm run dev
```

### 5. Configurar o Frontend

```bash
cd ../frontend
npm install
```

#### Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="PontoHub Portal"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

#### Iniciar o Servidor
```bash
npm run dev
```

## Configuração do Banco de Dados

### Migrações

O sistema usa Prisma para gerenciar migrações do banco de dados.

#### Aplicar Migrações
```bash
cd backend
npx prisma migrate deploy
```

#### Criar Nova Migração
```bash
npx prisma migrate dev --name nome_da_migracao
```

#### Resetar Banco de Dados
```bash
npx prisma migrate reset
```

### Seed de Dados

Para popular o banco com dados de exemplo:

```bash
cd backend
npx prisma db seed
```

Isso criará:
- Usuário administrador padrão
- Empresas de exemplo
- Projetos de exemplo
- Tarefas de exemplo

### Backup e Restauração

#### Criar Backup
```bash
# Com Docker
./scripts/backup.sh

# Manual
pg_dump -U pontohub_user -h localhost pontohub_portal > backup.sql
```

#### Restaurar Backup
```bash
# Manual
psql -U pontohub_user -h localhost pontohub_portal < backup.sql
```

## Configuração de Ambiente

### Variáveis de Ambiente Importantes

#### Backend

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|---------|-------------|
| `NODE_ENV` | Ambiente de execução | development | Não |
| `PORT` | Porta do servidor | 3001 | Não |
| `DATABASE_URL` | URL do PostgreSQL | - | Sim |
| `REDIS_URL` | URL do Redis | - | Não |
| `JWT_SECRET` | Chave secreta JWT | - | Sim |
| `JWT_REFRESH_SECRET` | Chave refresh JWT | - | Sim |
| `CORS_ORIGIN` | Origem permitida CORS | * | Não |
| `SMTP_HOST` | Servidor SMTP | - | Não |
| `SMTP_PORT` | Porta SMTP | 587 | Não |
| `SMTP_USER` | Usuário SMTP | - | Não |
| `SMTP_PASS` | Senha SMTP | - | Não |

#### Frontend

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | URL da API | http://localhost:3001 | Sim |
| `NEXT_PUBLIC_APP_NAME` | Nome da aplicação | PontoHub Portal | Não |
| `NEXT_PUBLIC_APP_VERSION` | Versão da aplicação | 1.0.0 | Não |

### Configuração de Produção

#### Segurança

1. **Altere todas as senhas padrão**
2. **Use HTTPS em produção**
3. **Configure CORS adequadamente**
4. **Use senhas fortes para JWT**
5. **Configure firewall adequadamente**

#### Performance

1. **Configure cache Redis**
2. **Use CDN para assets estáticos**
3. **Configure compressão gzip**
4. **Otimize queries do banco**

#### Monitoramento

1. **Configure logs estruturados**
2. **Implemente health checks**
3. **Configure alertas**
4. **Monitore métricas de performance**

## Verificação da Instalação

### 1. Verificar Serviços

#### Com Docker
```bash
docker-compose ps
```

Todos os serviços devem estar com status "Up".

#### Manual
```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar Redis
redis-cli ping

# Verificar Backend
curl http://localhost:3001/api/health

# Verificar Frontend
curl http://localhost:3000
```

### 2. Testar Funcionalidades

#### Criar Usuário de Teste
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Teste",
    "lastName": "Usuario",
    "email": "teste@example.com",
    "password": "senha123",
    "role": "ADMIN"
  }'
```

#### Fazer Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Verificar Logs

#### Com Docker
```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs backend
docker-compose logs frontend
```

#### Manual
```bash
# Backend (se usando PM2)
pm2 logs backend

# Frontend (se usando PM2)
pm2 logs frontend
```

## Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco de Dados

**Sintoma**: `Error: connect ECONNREFUSED`

**Soluções**:
- Verificar se PostgreSQL está rodando
- Verificar URL de conexão no `.env`
- Verificar credenciais do banco
- Verificar firewall/rede

#### 2. Erro de Permissão no Docker

**Sintoma**: `Permission denied`

**Soluções**:
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar
newgrp docker
```

#### 3. Porta já em Uso

**Sintoma**: `EADDRINUSE: address already in use`

**Soluções**:
```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou alterar porta no .env
```

#### 4. Erro de Migração do Prisma

**Sintoma**: `Migration failed`

**Soluções**:
```bash
# Resetar migrações
npx prisma migrate reset

# Aplicar migrações manualmente
npx prisma db push
```

#### 5. Erro de CORS

**Sintoma**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Soluções**:
- Verificar `CORS_ORIGIN` no backend
- Verificar `NEXT_PUBLIC_API_URL` no frontend
- Verificar se URLs estão corretas

### Logs de Debug

#### Habilitar Logs Detalhados

**Backend**:
```env
DEBUG=*
LOG_LEVEL=debug
```

**Frontend**:
```env
NEXT_PUBLIC_DEBUG=true
```

### Comandos Úteis

#### Docker
```bash
# Reconstruir containers
docker-compose up --build

# Limpar volumes
docker-compose down -v

# Limpar tudo
docker system prune -a
```

#### Prisma
```bash
# Ver status das migrações
npx prisma migrate status

# Gerar cliente
npx prisma generate

# Visualizar banco
npx prisma studio
```

#### Node.js
```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## Próximos Passos

Após a instalação bem-sucedida:

1. **Configure usuários e permissões**
2. **Importe dados existentes** (se aplicável)
3. **Configure backup automático**
4. **Configure monitoramento**
5. **Configure SSL/HTTPS** (produção)
6. **Configure domínio personalizado** (produção)

## Suporte

Para suporte adicional:

- **Documentação**: Consulte outros arquivos na pasta `docs/`
- **Issues**: Abra uma issue no GitHub
- **Email**: support@pontohub.com
- **Discord**: [Link do servidor Discord]

## Contribuição

Para contribuir com melhorias na instalação:

1. Fork o repositório
2. Crie uma branch para sua melhoria
3. Teste em diferentes ambientes
4. Abra um Pull Request

---

**Nota**: Este guia é atualizado regularmente. Verifique a versão mais recente no repositório oficial.

