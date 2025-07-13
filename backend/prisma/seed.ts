import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pontohub.com' },
    update: {},
    create: {
      email: 'admin@pontohub.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'PontoHub',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 10)
  const employee = await prisma.user.upsert({
    where: { email: 'joao@pontohub.com' },
    update: {},
    create: {
      email: 'joao@pontohub.com',
      passwordHash: employeePassword,
      firstName: 'João',
      lastName: 'Silva',
      role: UserRole.EMPLOYEE,
      phone: '(11) 99999-9999',
      isActive: true,
    },
  })
  console.log('✅ Employee user created:', employee.email)

  // Create freelancer user
  const freelancerPassword = await bcrypt.hash('freelancer123', 10)
  const freelancer = await prisma.user.upsert({
    where: { email: 'maria@freelancer.com' },
    update: {},
    create: {
      email: 'maria@freelancer.com',
      passwordHash: freelancerPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      role: UserRole.FREELANCER,
      phone: '(11) 88888-8888',
      isActive: true,
    },
  })
  console.log('✅ Freelancer user created:', freelancer.email)

  // Create client user
  const clientPassword = await bcrypt.hash('client123', 10)
  const client = await prisma.user.upsert({
    where: { email: 'carlos@empresa.com' },
    update: {},
    create: {
      email: 'carlos@empresa.com',
      passwordHash: clientPassword,
      firstName: 'Carlos',
      lastName: 'Oliveira',
      role: UserRole.CLIENT,
      phone: '(11) 77777-7777',
      isActive: true,
    },
  })
  console.log('✅ Client user created:', client.email)

  // Create companies
  const company1 = await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: {
      id: 'company-1',
      name: 'Tech Solutions Ltda',
      email: 'contato@techsolutions.com',
      phone: '(11) 3333-3333',
      website: 'https://techsolutions.com',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      taxId: '12.345.678/0001-90',
      isActive: true,
    },
  })

  const company2 = await prisma.company.upsert({
    where: { id: 'company-2' },
    update: {},
    create: {
      id: 'company-2',
      name: 'Digital Marketing Pro',
      email: 'hello@digitalmarketing.com',
      phone: '(11) 4444-4444',
      website: 'https://digitalmarketing.com',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      taxId: '98.765.432/0001-10',
      isActive: true,
    },
  })
  console.log('✅ Companies created')

  // Create company-user relationships
  await prisma.companyUser.createMany({
    data: [
      {
        companyId: company1.id,
        userId: client.id,
        role: UserRole.CLIENT,
      },
      {
        companyId: company2.id,
        userId: client.id,
        role: UserRole.CLIENT,
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Company-user relationships created')

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      companyId: company1.id,
      name: 'Sistema de E-commerce',
      description: 'Desenvolvimento de plataforma de e-commerce completa com painel administrativo',
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
      budget: 50000.00,
      hourlyRate: 150.00,
      createdBy: admin.id,
    },
  })

  const project2 = await prisma.project.upsert({
    where: { id: 'project-2' },
    update: {},
    create: {
      id: 'project-2',
      companyId: company2.id,
      name: 'Campanha Digital 2024',
      description: 'Estratégia completa de marketing digital incluindo redes sociais e Google Ads',
      status: ProjectStatus.PLANNING,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      budget: 30000.00,
      hourlyRate: 120.00,
      createdBy: admin.id,
    },
  })
  console.log('✅ Projects created')

  // Create tasks
  const tasks = [
    {
      id: 'task-1',
      projectId: project1.id,
      title: 'Análise de Requisitos',
      description: 'Levantamento detalhado dos requisitos funcionais e não funcionais',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      assignedTo: employee.id,
      estimatedHours: 40,
      dueDate: new Date('2024-01-30'),
      completedAt: new Date('2024-01-28'),
      createdBy: admin.id,
    },
    {
      id: 'task-2',
      projectId: project1.id,
      title: 'Design da Interface',
      description: 'Criação dos wireframes e protótipos da interface do usuário',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignedTo: freelancer.id,
      estimatedHours: 60,
      dueDate: new Date('2024-02-15'),
      createdBy: admin.id,
    },
    {
      id: 'task-3',
      projectId: project1.id,
      title: 'Desenvolvimento Backend',
      description: 'Implementação da API REST e integração com banco de dados',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assignedTo: employee.id,
      estimatedHours: 120,
      dueDate: new Date('2024-04-01'),
      createdBy: admin.id,
    },
    {
      id: 'task-4',
      projectId: project2.id,
      title: 'Pesquisa de Mercado',
      description: 'Análise da concorrência e identificação do público-alvo',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      assignedTo: freelancer.id,
      estimatedHours: 20,
      dueDate: new Date('2024-02-10'),
      completedAt: new Date('2024-02-08'),
      createdBy: admin.id,
    },
    {
      id: 'task-5',
      projectId: project2.id,
      title: 'Criação de Conteúdo',
      description: 'Desenvolvimento de conteúdo para redes sociais e blog',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      assignedTo: freelancer.id,
      estimatedHours: 80,
      dueDate: new Date('2024-03-15'),
      createdBy: admin.id,
    },
  ]

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    })
  }
  console.log('✅ Tasks created')

  // Create time entries
  const timeEntries = [
    {
      taskId: 'task-1',
      userId: employee.id,
      description: 'Reunião com cliente para levantamento de requisitos',
      startTime: new Date('2024-01-20T09:00:00Z'),
      endTime: new Date('2024-01-20T12:00:00Z'),
      durationMinutes: 180,
      hourlyRate: 150.00,
      isBillable: true,
      isApproved: true,
      approvedBy: admin.id,
      approvedAt: new Date('2024-01-21T10:00:00Z'),
    },
    {
      taskId: 'task-1',
      userId: employee.id,
      description: 'Documentação dos requisitos levantados',
      startTime: new Date('2024-01-22T14:00:00Z'),
      endTime: new Date('2024-01-22T18:00:00Z'),
      durationMinutes: 240,
      hourlyRate: 150.00,
      isBillable: true,
      isApproved: true,
      approvedBy: admin.id,
      approvedAt: new Date('2024-01-23T09:00:00Z'),
    },
    {
      taskId: 'task-2',
      userId: freelancer.id,
      description: 'Criação de wireframes para páginas principais',
      startTime: new Date('2024-02-01T10:00:00Z'),
      endTime: new Date('2024-02-01T16:00:00Z'),
      durationMinutes: 360,
      hourlyRate: 120.00,
      isBillable: true,
      isApproved: false,
    },
    {
      taskId: 'task-4',
      userId: freelancer.id,
      description: 'Análise da concorrência e benchmarking',
      startTime: new Date('2024-02-05T09:00:00Z'),
      endTime: new Date('2024-02-05T17:00:00Z'),
      durationMinutes: 480,
      hourlyRate: 120.00,
      isBillable: true,
      isApproved: true,
      approvedBy: admin.id,
      approvedAt: new Date('2024-02-06T10:00:00Z'),
    },
  ]

  for (const entry of timeEntries) {
    await prisma.timeEntry.create({
      data: entry,
    })
  }
  console.log('✅ Time entries created')

  // Create comments
  const comments = [
    {
      taskId: 'task-1',
      userId: admin.id,
      content: 'Ótimo trabalho na documentação dos requisitos! Muito detalhado e bem estruturado.',
    },
    {
      taskId: 'task-2',
      userId: employee.id,
      content: 'Os wireframes estão ficando excelentes. Sugiro apenas ajustar o layout da página de checkout.',
    },
    {
      taskId: 'task-4',
      userId: admin.id,
      content: 'Análise muito completa. Os insights sobre o público-alvo serão muito úteis para a estratégia.',
    },
  ]

  for (const comment of comments) {
    await prisma.comment.create({
      data: comment,
    })
  }
  console.log('✅ Comments created')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Test accounts created:')
  console.log('👤 Admin: admin@pontohub.com / admin123')
  console.log('👤 Employee: joao@pontohub.com / employee123')
  console.log('👤 Freelancer: maria@freelancer.com / freelancer123')
  console.log('👤 Client: carlos@empresa.com / client123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

