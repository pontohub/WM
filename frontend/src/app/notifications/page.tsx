'use client'

import { useState } from 'react'
import { Bell, Check, Trash2, Filter, Search, AlertTriangle, Info, CheckCircle, Clock, User, FileText, DollarSign, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const notifications = [
  {
    id: 1,
    type: 'task',
    title: 'Nova tarefa atribuída',
    message: 'Você foi atribuído à tarefa "Implementar autenticação JWT" no projeto Sistema E-commerce',
    timestamp: '2024-01-15T10:30:00',
    read: false,
    priority: 'high',
    from: 'João Silva',
    action: 'task_assigned',
    metadata: {
      taskId: 1,
      projectName: 'Sistema E-commerce'
    }
  },
  {
    id: 2,
    type: 'payment',
    title: 'Pagamento recebido',
    message: 'Fatura INV-2024-001 no valor de R$ 25.000,00 foi paga pelo cliente TechCorp',
    timestamp: '2024-01-15T09:15:00',
    read: false,
    priority: 'normal',
    from: 'Sistema',
    action: 'payment_received',
    metadata: {
      invoiceId: 'INV-2024-001',
      amount: 25000,
      client: 'TechCorp'
    }
  },
  {
    id: 3,
    type: 'deadline',
    title: 'Prazo se aproximando',
    message: 'A tarefa "Design da página de checkout" vence em 2 dias',
    timestamp: '2024-01-15T08:00:00',
    read: true,
    priority: 'medium',
    from: 'Sistema',
    action: 'deadline_warning',
    metadata: {
      taskId: 2,
      daysLeft: 2
    }
  },
  {
    id: 4,
    type: 'project',
    title: 'Projeto atualizado',
    message: 'O progresso do projeto "App Mobile Banking" foi atualizado para 85%',
    timestamp: '2024-01-14T16:45:00',
    read: true,
    priority: 'normal',
    from: 'Maria Santos',
    action: 'project_updated',
    metadata: {
      projectId: 2,
      progress: 85
    }
  },
  {
    id: 5,
    type: 'user',
    title: 'Novo usuário adicionado',
    message: 'Beatriz Lima foi adicionada ao projeto Portal Corporativo como Designer',
    timestamp: '2024-01-14T14:20:00',
    read: true,
    priority: 'low',
    from: 'Pedro Costa',
    action: 'user_added',
    metadata: {
      userId: 6,
      projectName: 'Portal Corporativo',
      role: 'Designer'
    }
  },
  {
    id: 6,
    type: 'invoice',
    title: 'Nova fatura gerada',
    message: 'Fatura INV-2024-002 no valor de R$ 18.500,00 foi gerada para o cliente FinanceInc',
    timestamp: '2024-01-14T11:30:00',
    read: true,
    priority: 'normal',
    from: 'Sistema',
    action: 'invoice_generated',
    metadata: {
      invoiceId: 'INV-2024-002',
      amount: 18500,
      client: 'FinanceInc'
    }
  },
  {
    id: 7,
    type: 'deadline',
    title: 'Tarefa vencida',
    message: 'A tarefa "Configurar pipeline CI/CD" está atrasada há 1 dia',
    timestamp: '2024-01-13T23:59:00',
    read: false,
    priority: 'high',
    from: 'Sistema',
    action: 'task_overdue',
    metadata: {
      taskId: 3,
      daysOverdue: 1
    }
  },
  {
    id: 8,
    type: 'system',
    title: 'Backup realizado',
    message: 'Backup automático do sistema foi realizado com sucesso',
    timestamp: '2024-01-13T02:00:00',
    read: true,
    priority: 'low',
    from: 'Sistema',
    action: 'backup_completed',
    metadata: {}
  },
  {
    id: 9,
    type: 'task',
    title: 'Tarefa concluída',
    message: 'A tarefa "Otimização de performance" foi marcada como concluída',
    timestamp: '2024-01-12T17:30:00',
    read: true,
    priority: 'normal',
    from: 'Carlos Mendes',
    action: 'task_completed',
    metadata: {
      taskId: 5,
      projectName: 'Portal Corporativo'
    }
  },
  {
    id: 10,
    type: 'message',
    title: 'Nova mensagem',
    message: 'Você recebeu uma nova mensagem de Ana Oliveira sobre o projeto Sistema E-commerce',
    timestamp: '2024-01-12T15:45:00',
    read: true,
    priority: 'normal',
    from: 'Ana Oliveira',
    action: 'message_received',
    metadata: {
      messageId: 1,
      projectName: 'Sistema E-commerce'
    }
  }
]

const typeConfig = {
  'task': {
    label: 'Tarefa',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  'payment': {
    label: 'Pagamento',
    color: 'bg-green-100 text-green-800',
    icon: DollarSign
  },
  'deadline': {
    label: 'Prazo',
    color: 'bg-red-100 text-red-800',
    icon: Clock
  },
  'project': {
    label: 'Projeto',
    color: 'bg-purple-100 text-purple-800',
    icon: FileText
  },
  'user': {
    label: 'Usuário',
    color: 'bg-orange-100 text-orange-800',
    icon: User
  },
  'invoice': {
    label: 'Fatura',
    color: 'bg-yellow-100 text-yellow-800',
    icon: FileText
  },
  'system': {
    label: 'Sistema',
    color: 'bg-gray-100 text-gray-800',
    icon: Settings
  },
  'message': {
    label: 'Mensagem',
    color: 'bg-indigo-100 text-indigo-800',
    icon: User
  }
}

const priorityConfig = {
  'high': {
    label: 'Alta',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle
  },
  'medium': {
    label: 'Média',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Info
  },
  'normal': {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-800',
    icon: Info
  },
  'low': {
    label: 'Baixa',
    color: 'bg-gray-100 text-gray-800',
    icon: Info
  }
}

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.from.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || notification.type === selectedType
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority
    const matchesRead = !showUnreadOnly || !notification.read
    return matchesSearch && matchesType && matchesPriority && matchesRead
  })

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m atrás`
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d atrás`
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const markAsRead = (id: number) => {
    // In a real app, this would update the notification in the backend
    console.log(`Marking notification ${id} as read`)
  }

  const markAllAsRead = () => {
    // In a real app, this would update all notifications in the backend
    console.log('Marking all notifications as read')
  }

  const deleteNotification = (id: number) => {
    // In a real app, this would delete the notification from the backend
    console.log(`Deleting notification ${id}`)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notificações
            </h1>
            <p className="text-muted-foreground">
              Acompanhe atualizações e eventos importantes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">
                Notificações totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">
                Precisam atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.timestamp.startsWith('2024-01-15')).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Notificações de hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Urgentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="task">Tarefa</option>
              <option value="payment">Pagamento</option>
              <option value="deadline">Prazo</option>
              <option value="project">Projeto</option>
              <option value="user">Usuário</option>
              <option value="invoice">Fatura</option>
              <option value="system">Sistema</option>
              <option value="message">Mensagem</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Não Lidas
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const TypeIcon = typeConfig[notification.type as keyof typeof typeConfig].icon
            const PriorityIcon = priorityConfig[notification.priority as keyof typeof priorityConfig].icon
            
            return (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                      {notification.from !== 'Sistema' ? (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(notification.from)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-semibold ${!notification.read ? 'text-blue-900' : ''}`}>
                              {notification.title}
                            </h3>
                            <Badge className={typeConfig[notification.type as keyof typeof typeConfig].color}>
                              {typeConfig[notification.type as keyof typeof typeConfig].label}
                            </Badge>
                            <Badge className={priorityConfig[notification.priority as keyof typeof priorityConfig].color}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityConfig[notification.priority as keyof typeof priorityConfig].label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>De: {notification.from}</span>
                            <span>{formatDateTime(notification.timestamp)}</span>
                            {!notification.read && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Nova
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou aguarde novas notificações.
            </p>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificações
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

