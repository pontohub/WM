'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react'

const stats = [
  {
    title: 'Total de Usuários',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Empresas Ativas',
    value: '89',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Building2,
  },
  {
    title: 'Projetos em Andamento',
    value: '156',
    change: '+23%',
    changeType: 'positive' as const,
    icon: FolderOpen,
  },
  {
    title: 'Tarefas Concluídas',
    value: '2,847',
    change: '+18%',
    changeType: 'positive' as const,
    icon: CheckSquare,
  },
  {
    title: 'Horas Trabalhadas',
    value: '12,456',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Clock,
  },
  {
    title: 'Receita Total',
    value: 'R$ 245,890',
    change: '+15%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
]

const recentProjects = [
  {
    id: 1,
    name: 'Sistema de E-commerce',
    company: 'TechCorp',
    status: 'Em Andamento',
    progress: 75,
    dueDate: '2024-02-15',
  },
  {
    id: 2,
    name: 'App Mobile Banking',
    company: 'FinanceInc',
    status: 'Em Revisão',
    progress: 90,
    dueDate: '2024-01-30',
  },
  {
    id: 3,
    name: 'Portal do Cliente',
    company: 'ServicePro',
    status: 'Planejamento',
    progress: 25,
    dueDate: '2024-03-01',
  },
]

const recentTasks = [
  {
    id: 1,
    title: 'Implementar autenticação JWT',
    project: 'Sistema de E-commerce',
    assignee: 'João Silva',
    status: 'Em Progresso',
    priority: 'Alta',
  },
  {
    id: 2,
    title: 'Design da tela de login',
    project: 'App Mobile Banking',
    assignee: 'Maria Santos',
    status: 'Concluída',
    priority: 'Média',
  },
  {
    id: 3,
    title: 'Configurar banco de dados',
    project: 'Portal do Cliente',
    assignee: 'Pedro Costa',
    status: 'Pendente',
    priority: 'Alta',
  },
]

function StatCard({ title, value, change, changeType, icon: Icon }: typeof stats[0]) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className={changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>{' '}
          em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Em Andamento':
    case 'Em Progresso':
      return <Badge variant="default">{status}</Badge>
    case 'Em Revisão':
      return <Badge variant="warning">{status}</Badge>
    case 'Concluída':
      return <Badge variant="success">{status}</Badge>
    case 'Planejamento':
    case 'Pendente':
      return <Badge variant="secondary">{status}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'Alta':
      return <Badge variant="destructive">{priority}</Badge>
    case 'Média':
      return <Badge variant="warning">{priority}</Badge>
    case 'Baixa':
      return <Badge variant="secondary">{priority}</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projetos Recentes
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso dos seus projetos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.company}</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status)}
                        <span className="text-xs text-muted-foreground">
                          Prazo: {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{project.progress}%</div>
                      <div className="w-16 h-2 bg-muted rounded-full mt-1">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tarefas Recentes
              </CardTitle>
              <CardDescription>
                Últimas atividades da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.project}</p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {task.assignee}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">João Silva</span> concluiu a tarefa{' '}
                    <span className="font-medium">"Implementar autenticação JWT"</span>
                  </p>
                  <p className="text-xs text-muted-foreground">há 2 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Maria Santos</span> criou um novo projeto{' '}
                    <span className="font-medium">"Sistema de CRM"</span>
                  </p>
                  <p className="text-xs text-muted-foreground">há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Pedro Costa</span> atualizou o status do projeto{' '}
                    <span className="font-medium">"Portal do Cliente"</span>
                  </p>
                  <p className="text-xs text-muted-foreground">há 1 hora</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Ana Oliveira</span> adicionou um novo usuário{' '}
                    <span className="font-medium">"Carlos Mendes"</span>
                  </p>
                  <p className="text-xs text-muted-foreground">há 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

