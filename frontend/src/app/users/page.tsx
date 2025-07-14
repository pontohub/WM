'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Calendar, Shield, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const users = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@pontohub.com',
    phone: '+55 11 99999-9999',
    role: 'Administrador',
    department: 'TI',
    company: 'PontoHub',
    status: 'Ativo',
    avatar: '/avatars/joao.jpg',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-14T10:30:00',
    projectsCount: 5,
    tasksCompleted: 127,
    hoursWorked: 1240
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@techcorp.com',
    phone: '+55 11 88888-8888',
    role: 'Gerente de Projeto',
    department: 'Desenvolvimento',
    company: 'TechCorp',
    status: 'Ativo',
    avatar: '/avatars/maria.jpg',
    joinDate: '2023-03-20',
    lastLogin: '2024-01-14T09:15:00',
    projectsCount: 3,
    tasksCompleted: 89,
    hoursWorked: 980
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro.costa@servicepro.com',
    phone: '+55 11 77777-7777',
    role: 'Desenvolvedor Senior',
    department: 'Desenvolvimento',
    company: 'ServicePro',
    status: 'Ativo',
    avatar: '/avatars/pedro.jpg',
    joinDate: '2023-05-10',
    lastLogin: '2024-01-14T08:45:00',
    projectsCount: 4,
    tasksCompleted: 156,
    hoursWorked: 1120
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana.oliveira@financeinc.com',
    phone: '+55 11 66666-6666',
    role: 'Designer UX/UI',
    department: 'Design',
    company: 'FinanceInc',
    status: 'Ativo',
    avatar: '/avatars/ana.jpg',
    joinDate: '2023-07-01',
    lastLogin: '2024-01-13T16:20:00',
    projectsCount: 2,
    tasksCompleted: 67,
    hoursWorked: 720
  },
  {
    id: 5,
    name: 'Carlos Mendes',
    email: 'carlos.mendes@pontohub.com',
    phone: '+55 11 55555-5555',
    role: 'Desenvolvedor Junior',
    department: 'Desenvolvimento',
    company: 'PontoHub',
    status: 'Inativo',
    avatar: '/avatars/carlos.jpg',
    joinDate: '2023-09-15',
    lastLogin: '2024-01-10T14:30:00',
    projectsCount: 1,
    tasksCompleted: 23,
    hoursWorked: 320
  },
  {
    id: 6,
    name: 'Beatriz Lima',
    email: 'beatriz.lima@servicepro.com',
    phone: '+55 11 44444-4444',
    role: 'Analista de Qualidade',
    department: 'QA',
    company: 'ServicePro',
    status: 'Ativo',
    avatar: '/avatars/beatriz.jpg',
    joinDate: '2023-11-01',
    lastLogin: '2024-01-14T11:00:00',
    projectsCount: 2,
    tasksCompleted: 45,
    hoursWorked: 480
  }
]

const statusColors = {
  'Ativo': 'bg-green-100 text-green-800',
  'Inativo': 'bg-red-100 text-red-800',
  'Pendente': 'bg-yellow-100 text-yellow-800'
}

const roleColors = {
  'Administrador': 'bg-purple-100 text-purple-800',
  'Gerente de Projeto': 'bg-blue-100 text-blue-800',
  'Desenvolvedor Senior': 'bg-indigo-100 text-indigo-800',
  'Desenvolvedor Junior': 'bg-cyan-100 text-cyan-800',
  'Designer UX/UI': 'bg-pink-100 text-pink-800',
  'Analista de Qualidade': 'bg-orange-100 text-orange-800'
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários e suas permissões
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +3 novos este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'Ativo').length}
              </div>
              <p className="text-xs text-muted-foreground">
                83% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'Administrador').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Acesso total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, u) => sum + u.hoursWorked, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total acumulado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas as Funções</option>
              <option value="Administrador">Administrador</option>
              <option value="Gerente de Projeto">Gerente de Projeto</option>
              <option value="Desenvolvedor Senior">Desenvolvedor Senior</option>
              <option value="Desenvolvedor Junior">Desenvolvedor Junior</option>
              <option value="Designer UX/UI">Designer UX/UI</option>
              <option value="Analista de Qualidade">Analista de Qualidade</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.company}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                      {user.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Role and Department */}
                <div className="space-y-2">
                  <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                    {user.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-blue-600">{user.projectsCount}</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-green-600">{user.tasksCompleted}</div>
                    <div className="text-xs text-muted-foreground">Tarefas</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-purple-600">{user.hoursWorked}h</div>
                    <div className="text-xs text-muted-foreground">Horas</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrada:</span>
                    <span>{formatDate(user.joinDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último acesso:</span>
                    <span>{formatDateTime(user.lastLogin)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou adicionar um novo usuário.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

