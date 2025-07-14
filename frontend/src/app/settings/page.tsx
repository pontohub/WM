'use client'

import { useState } from 'react'
import { Save, User, Bell, Shield, Palette, Database, Mail, Globe, Key, Download, Upload, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Profile
    name: 'João Silva',
    email: 'joao.silva@pontohub.com',
    phone: '+55 11 99999-9999',
    position: 'Desenvolvedor Senior',
    department: 'Tecnologia',
    bio: 'Desenvolvedor full-stack com 8 anos de experiência em React, Node.js e Python.',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    taskNotifications: true,
    projectNotifications: true,
    invoiceNotifications: true,
    
    // Appearance
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    
    // System
    companyName: 'PontoHub',
    companyEmail: 'contato@pontohub.com',
    companyPhone: '+55 11 3333-3333',
    companyAddress: 'Rua das Flores, 123 - São Paulo, SP',
    backupFrequency: 'daily',
    dataRetention: '365'
  })

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'system', label: 'Sistema', icon: Database }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    console.log('Saving settings:', formData)
    // In a real app, this would save to the backend
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                JS
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
              <Button variant="ghost" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <Input
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="Tecnologia">Tecnologia</option>
                <option value="Design">Design</option>
                <option value="Vendas">Vendas</option>
                <option value="Marketing">Marketing</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">Recursos Humanos</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Biografia</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[100px]"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Mantenha sua conta segura com uma senha forte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha Atual</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Senha</label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Nova Senha</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Autenticação de Dois Fatores</div>
              <div className="text-sm text-muted-foreground">
                Proteja sua conta com verificação em duas etapas
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={formData.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {formData.twoFactorEnabled ? 'Ativado' : 'Desativado'}
              </Badge>
              <Button
                variant={formData.twoFactorEnabled ? "destructive" : "default"}
                onClick={() => handleInputChange('twoFactorEnabled', !formData.twoFactorEnabled)}
              >
                {formData.twoFactorEnabled ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Gerencie dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Chrome - Windows</div>
                <div className="text-sm text-muted-foreground">São Paulo, Brasil • Agora</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Atual</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Safari - iPhone</div>
                <div className="text-sm text-muted-foreground">São Paulo, Brasil • 2 horas atrás</div>
              </div>
              <Button variant="outline" size="sm">
                Revogar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Configure como e quando você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações por Email</div>
                <div className="text-sm text-muted-foreground">
                  Receba atualizações importantes por email
                </div>
              </div>
              <Button
                variant={formData.emailNotifications ? "default" : "outline"}
                onClick={() => handleInputChange('emailNotifications', !formData.emailNotifications)}
              >
                {formData.emailNotifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações Push</div>
                <div className="text-sm text-muted-foreground">
                  Receba notificações em tempo real no navegador
                </div>
              </div>
              <Button
                variant={formData.pushNotifications ? "default" : "outline"}
                onClick={() => handleInputChange('pushNotifications', !formData.pushNotifications)}
              >
                {formData.pushNotifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações de Tarefas</div>
                <div className="text-sm text-muted-foreground">
                  Alertas sobre prazos e atualizações de tarefas
                </div>
              </div>
              <Button
                variant={formData.taskNotifications ? "default" : "outline"}
                onClick={() => handleInputChange('taskNotifications', !formData.taskNotifications)}
              >
                {formData.taskNotifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações de Projetos</div>
                <div className="text-sm text-muted-foreground">
                  Atualizações sobre progresso e marcos de projetos
                </div>
              </div>
              <Button
                variant={formData.projectNotifications ? "default" : "outline"}
                onClick={() => handleInputChange('projectNotifications', !formData.projectNotifications)}
              >
                {formData.projectNotifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações de Faturas</div>
                <div className="text-sm text-muted-foreground">
                  Alertas sobre pagamentos e vencimentos
                </div>
              </div>
              <Button
                variant={formData.invoiceNotifications ? "default" : "outline"}
                onClick={() => handleInputChange('invoiceNotifications', !formData.invoiceNotifications)}
              >
                {formData.invoiceNotifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a interface do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tema</label>
            <select
              value={formData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma</label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fuso Horário</label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Configure as informações da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Empresa</label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email da Empresa</label>
              <Input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone da Empresa</label>
              <Input
                value={formData.companyPhone}
                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input
              value={formData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Dados</CardTitle>
          <CardDescription>
            Configure backup automático e retenção de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequência de Backup</label>
            <select
              value={formData.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Retenção de Dados (dias)</label>
            <Input
              type="number"
              value={formData.dataRetention}
              onChange={(e) => handleInputChange('dataRetention', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Backup
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Restaurar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes sobre a versão e status do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Versão</div>
              <div className="font-medium">PontoHub Portal v1.0.0</div>
            </div>
            <div>
              <div className="text-muted-foreground">Último Backup</div>
              <div className="font-medium">15/01/2024 02:00</div>
            </div>
            <div>
              <div className="text-muted-foreground">Uptime</div>
              <div className="font-medium">15 dias, 8 horas</div>
            </div>
            <div>
              <div className="text-muted-foreground">Usuários Ativos</div>
              <div className="font-medium">1,234 usuários</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e configurações do sistema
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Tabs and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'system' && renderSystemTab()}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

