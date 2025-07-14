'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Building, Users, MapPin, Phone, Mail, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const companies = [
  {
    id: 1,
    name: 'TechCorp',
    description: 'Empresa de tecnologia especializada em soluções de e-commerce',
    industry: 'Tecnologia',
    size: 'Grande',
    status: 'Ativo',
    logo: '/logos/techcorp.jpg',
    website: 'https://techcorp.com',
    email: 'contato@techcorp.com',
    phone: '+55 11 3333-3333',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    foundedYear: 2015,
    employees: 250,
    projects: 8,
    activeProjects: 3,
    totalRevenue: 850000,
    lastProject: '2024-01-10'
  },
  {
    id: 2,
    name: 'FinanceInc',
    description: 'Instituição financeira com foco em soluções digitais',
    industry: 'Financeiro',
    size: 'Grande',
    status: 'Ativo',
    logo: '/logos/financeinc.jpg',
    website: 'https://financeinc.com',
    email: 'contato@financeinc.com',
    phone: '+55 11 4444-4444',
    address: 'Rua Augusta, 500 - São Paulo, SP',
    foundedYear: 2010,
    employees: 500,
    projects: 5,
    activeProjects: 2,
    totalRevenue: 1200000,
    lastProject: '2024-01-05'
  },
  {
    id: 3,
    name: 'ServicePro',
    description: 'Consultoria em serviços profissionais e gestão empresarial',
    industry: 'Consultoria',
    size: 'Média',
    status: 'Ativo',
    logo: '/logos/servicepro.jpg',
    website: 'https://servicepro.com',
    email: 'contato@servicepro.com',
    phone: '+55 11 5555-5555',
    address: 'Rua Faria Lima, 200 - São Paulo, SP',
    foundedYear: 2018,
    employees: 80,
    projects: 6,
    activeProjects: 4,
    totalRevenue: 420000,
    lastProject: '2024-01-12'
  },
  {
    id: 4,
    name: 'SalesForce Pro',
    description: 'Especialista em automação de vendas e CRM',
    industry: 'Software',
    size: 'Média',
    status: 'Ativo',
    logo: '/logos/salesforcepro.jpg',
    website: 'https://salesforcepro.com',
    email: 'contato@salesforcepro.com',
    phone: '+55 11 6666-6666',
    address: 'Av. Berrini, 300 - São Paulo, SP',
    foundedYear: 2020,
    employees: 45,
    projects: 3,
    activeProjects: 1,
    totalRevenue: 180000,
    lastProject: '2023-12-15'
  },
  {
    id: 5,
    name: 'StartupTech',
    description: 'Startup inovadora em soluções de IoT e automação',
    industry: 'Tecnologia',
    size: 'Pequena',
    status: 'Inativo',
    logo: '/logos/startuptech.jpg',
    website: 'https://startuptech.com',
    email: 'contato@startuptech.com',
    phone: '+55 11 7777-7777',
    address: 'Rua Oscar Freire, 100 - São Paulo, SP',
    foundedYear: 2022,
    employees: 15,
    projects: 2,
    activeProjects: 0,
    totalRevenue: 75000,
    lastProject: '2023-10-20'
  }
]

const statusColors = {
  'Ativo': 'bg-green-100 text-green-800',
  'Inativo': 'bg-red-100 text-red-800',
  'Pendente': 'bg-yellow-100 text-yellow-800'
}

const sizeColors = {
  'Pequena': 'bg-blue-100 text-blue-800',
  'Média': 'bg-purple-100 text-purple-800',
  'Grande': 'bg-orange-100 text-orange-800'
}

const industryColors = {
  'Tecnologia': 'bg-cyan-100 text-cyan-800',
  'Financeiro': 'bg-green-100 text-green-800',
  'Consultoria': 'bg-indigo-100 text-indigo-800',
  'Software': 'bg-pink-100 text-pink-800'
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    const matchesSize = selectedSize === 'all' || company.size === selectedSize
    const matchesStatus = selectedStatus === 'all' || company.status === selectedStatus
    return matchesSearch && matchesIndustry && matchesSize && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              Gerencie empresas clientes e parceiros
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 novas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.status === 'Ativo').length}
              </div>
              <p className="text-xs text-muted-foreground">
                80% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((sum, c) => sum + c.activeProjects, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(companies.reduce((sum, c) => sum + c.totalRevenue, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Acumulado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas as Indústrias</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Consultoria">Consultoria</option>
              <option value="Software">Software</option>
            </select>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tamanhos</option>
              <option value="Pequena">Pequena</option>
              <option value="Média">Média</option>
              <option value="Grande">Grande</option>
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

        {/* Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{company.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[company.status as keyof typeof statusColors]}>
                      {company.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Industry and Size */}
                <div className="flex gap-2">
                  <Badge className={industryColors[company.industry as keyof typeof industryColors]}>
                    {company.industry}
                  </Badge>
                  <Badge className={sizeColors[company.size as keyof typeof sizeColors]}>
                    {company.size}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{company.address}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-blue-600">{company.employees}</div>
                    <div className="text-xs text-muted-foreground">Funcionários</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-green-600">{company.projects}</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-purple-600">{company.activeProjects}</div>
                    <div className="text-xs text-muted-foreground">Ativos</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-orange-600">{company.foundedYear}</div>
                    <div className="text-xs text-muted-foreground">Fundação</div>
                  </div>
                </div>

                {/* Revenue and Last Project */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita Total:</span>
                    <span className="font-semibold">{formatCurrency(company.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Último Projeto:</span>
                    <span className="text-sm">{formatDate(company.lastProject)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Projetos
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Contato
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou adicionar uma nova empresa.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Empresa
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

