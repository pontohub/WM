# PontoHub Portal

Uma aplicação web completa para gestão de projetos, similar ao Plutio.com, desenvolvida com tecnologias modernas.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com SSR/SSG
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados
- **React Hook Form** - Formulários performáticos
- **Lucide React** - Ícones modernos

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **JWT** - Autenticação stateless
- **Joi** - Validação de dados

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Reverse proxy e load balancer
- **GitHub Actions** - CI/CD (configuração futura)

## 📋 Funcionalidades

### ✅ Implementadas
- **Autenticação e Autorização**
  - Login/logout com JWT
  - Controle de acesso baseado em roles (RBAC)
  - Refresh tokens para segurança

- **Gestão de Usuários**
  - CRUD completo de usuários
  - Múltiplos tipos: Admin, Employee, Freelancer, Client
  - Perfis personalizáveis

- **Gestão de Empresas/Clientes**
  - CRUD de empresas
  - Associação de usuários a empresas
  - Controle de acesso granular

- **Gestão de Projetos**
  - CRUD completo de projetos
  - Status e prioridades
  - Controle de orçamento e prazos
  - Estatísticas detalhadas

- **Sistema de Tarefas**
  - CRUD de tarefas com subtarefas
  - Atribuição para membros da equipe
  - Status e prioridades
  - Estimativas vs tempo real

- **Time Tracking**
  - Timer em tempo real
  - Registros manuais de tempo
  - Controle de horas faturáveis
  - Sistema de aprovação

- **Contratos e Faturamento**
  - CRUD de contratos com assinatura digital
  - Geração de faturas detalhadas
  - Controle de pagamentos
  - Cálculos automáticos

- **Portal do Cliente**
  - Dashboard personalizado
  - Visualização de projetos e progresso
  - Acesso a contratos e faturas
  - Relatórios de atividades

- **Sistema de Notificações**
  - Notificações em tempo real
  - Centro de notificações
  - Alertas automáticos para eventos
  - Controle de leitura

## 🐳 Deploy com Docker

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+
- Git

### Deploy Rápido

1. **Clone o repositório**
```bash
git clone <repository-url>
cd pontohub-portal
```

2. **Configure as variáveis de ambiente**
```bash
# Copie e edite os arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edite as configurações conforme necessário
nano backend/.env
nano frontend/.env
```

3. **Execute o deploy**
```bash
# Deploy em produção
./scripts/deploy.sh production

# Deploy em desenvolvimento
./scripts/deploy.sh development
```

### Deploy Manual

1. **Produção**
```bash
docker-compose up --build -d
```

2. **Desenvolvimento**
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

### Verificação do Deploy

Após o deploy, verifique se os serviços estão funcionando:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **API Docs**: http://localhost:3001/api

### Comandos Úteis

```bash
# Ver logs dos serviços
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Executar migrações do banco
docker-compose exec backend npx prisma migrate deploy

# Fazer backup do banco
./scripts/backup.sh

# Acessar container do backend
docker-compose exec backend sh

# Acessar container do banco
docker-compose exec postgres psql -U pontohub_user -d pontohub_portal
```

## 🔧 Desenvolvimento Local

### Sem Docker

1. **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL no .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

2. **Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure NEXT_PUBLIC_API_URL no .env.local
npm run dev
```

### Com Docker (Recomendado)

```bash
# Inicia ambiente de desenvolvimento com hot reload
./scripts/deploy.sh development
```

## 📊 Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │    Backend      │
│  (Reverse Proxy)│◄──►│   (Next.js)     │◄──►│   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │◄──►│   PostgreSQL    │
                       │   (Cache)       │    │   (Database)    │
                       └─────────────────┘    └─────────────────┘
```

## 🔐 Segurança

- **Autenticação JWT** com refresh tokens
- **Rate limiting** para APIs
- **CORS** configurado adequadamente
- **Headers de segurança** via Nginx
- **Validação** de dados em todas as rotas
- **Sanitização** de inputs
- **Controle de acesso** granular (RBAC)

## 📈 Monitoramento

- **Health checks** para todos os serviços
- **Logs estruturados** com timestamps
- **Métricas** de performance via Docker
- **Backup automático** do banco de dados

## 🚀 Próximos Passos

- [ ] Interface frontend completa
- [ ] Testes automatizados (Jest/Cypress)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Prometheus/Grafana
- [ ] SSL/HTTPS em produção
- [ ] CDN para assets estáticos
- [ ] Backup automático para cloud

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para support@pontohub.com ou abra uma issue no GitHub.

