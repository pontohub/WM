# Guia do Usuário - PontoHub Portal

Bem-vindo ao PontoHub Portal! Este guia irá ajudá-lo a navegar e utilizar todas as funcionalidades da plataforma de gestão de projetos.

## Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Dashboard Principal](#dashboard-principal)
3. [Gestão de Usuários](#gestão-de-usuários)
4. [Gestão de Empresas](#gestão-de-empresas)
5. [Gestão de Projetos](#gestão-de-projetos)
6. [Sistema de Tarefas](#sistema-de-tarefas)
7. [Time Tracking](#time-tracking)
8. [Contratos](#contratos)
9. [Faturamento](#faturamento)
10. [Portal do Cliente](#portal-do-cliente)
11. [Notificações](#notificações)
12. [Configurações](#configurações)

## Primeiros Passos

### Acessando o Sistema

1. Abra seu navegador e acesse: `http://localhost:3000` (ou o endereço configurado)
2. Na tela de login, insira suas credenciais
3. Clique em "Entrar"

### Primeiro Login

Se esta é sua primeira vez no sistema:

1. Use as credenciais padrão do administrador (se disponível)
2. Ou solicite acesso ao administrador do sistema
3. Após o login, altere sua senha nas configurações

### Tipos de Usuário

O sistema possui quatro tipos de usuário:

- **Admin**: Acesso total ao sistema
- **Employee**: Funcionário com acesso a recursos da empresa
- **Freelancer**: Acesso limitado a projetos específicos
- **Client**: Acesso apenas ao portal do cliente

## Dashboard Principal

O dashboard é a primeira tela que você vê após fazer login. Ele fornece uma visão geral das suas atividades e métricas importantes.

### Elementos do Dashboard

#### Cartões de Resumo
- **Projetos Ativos**: Número de projetos em andamento
- **Tarefas Pendentes**: Tarefas atribuídas a você
- **Horas Trabalhadas**: Total de horas no mês atual
- **Faturamento**: Valor faturado no período

#### Gráficos e Métricas
- **Progresso de Projetos**: Gráfico de barras mostrando o progresso
- **Distribuição de Tarefas**: Gráfico de pizza por status
- **Horas por Projeto**: Gráfico de linha temporal
- **Atividades Recentes**: Lista das últimas ações

#### Ações Rápidas
- **Nova Tarefa**: Criar tarefa rapidamente
- **Iniciar Timer**: Começar a cronometrar tempo
- **Ver Notificações**: Acessar centro de notificações
- **Relatórios**: Gerar relatórios rápidos

## Gestão de Usuários

*Disponível para: Admin, Employee*

### Listar Usuários

1. No menu lateral, clique em "Usuários"
2. Use os filtros para encontrar usuários específicos:
   - **Busca**: Por nome ou email
   - **Role**: Filtrar por tipo de usuário
   - **Status**: Ativo ou inativo
   - **Empresa**: Filtrar por empresa

### Criar Novo Usuário

1. Na página de usuários, clique em "Novo Usuário"
2. Preencha os campos obrigatórios:
   - **Nome**: Primeiro nome
   - **Sobrenome**: Último nome
   - **Email**: Email único no sistema
   - **Role**: Tipo de usuário
   - **Senha**: Senha temporária
3. Clique em "Salvar"

### Editar Usuário

1. Na lista de usuários, clique no ícone de edição
2. Modifique os campos necessários
3. Clique em "Salvar Alterações"

### Desativar Usuário

1. Na lista de usuários, clique no ícone de desativação
2. Confirme a ação
3. O usuário será desativado (não excluído)

## Gestão de Empresas

*Disponível para: Admin, Employee*

### Criar Nova Empresa

1. No menu lateral, clique em "Empresas"
2. Clique em "Nova Empresa"
3. Preencha as informações:
   - **Nome**: Nome da empresa
   - **Email**: Email de contato
   - **Telefone**: Telefone principal
   - **Website**: Site da empresa
   - **Endereço**: Endereço completo
   - **CNPJ/Tax ID**: Identificação fiscal
4. Clique em "Salvar"

### Gerenciar Usuários da Empresa

1. Na lista de empresas, clique em "Ver Detalhes"
2. Na aba "Usuários", você pode:
   - **Adicionar Usuário**: Associar usuário existente
   - **Remover Usuário**: Desassociar usuário
   - **Alterar Permissões**: Modificar acesso

### Estatísticas da Empresa

Na página de detalhes da empresa, você encontra:
- **Projetos Ativos**: Número de projetos em andamento
- **Faturamento Total**: Valor total faturado
- **Horas Trabalhadas**: Total de horas registradas
- **Contratos**: Status dos contratos

## Gestão de Projetos

### Criar Novo Projeto

1. No menu lateral, clique em "Projetos"
2. Clique em "Novo Projeto"
3. Preencha as informações:
   - **Nome**: Nome do projeto
   - **Descrição**: Descrição detalhada
   - **Empresa**: Empresa cliente
   - **Status**: Status inicial (geralmente "Planejamento")
   - **Prioridade**: Baixa, Média, Alta ou Urgente
   - **Orçamento**: Valor total do projeto
   - **Taxa Horária**: Valor por hora (opcional)
   - **Data de Início**: Data de início planejada
   - **Data de Fim**: Data de conclusão planejada
4. Clique em "Salvar"

### Acompanhar Progresso

Na página de detalhes do projeto:
- **Barra de Progresso**: Mostra percentual concluído
- **Tarefas**: Lista de tarefas do projeto
- **Time Tracking**: Horas trabalhadas
- **Orçamento vs Real**: Comparação de valores

### Status de Projetos

- **Planejamento**: Projeto em fase de planejamento
- **Ativo**: Projeto em execução
- **Em Espera**: Projeto pausado temporariamente
- **Concluído**: Projeto finalizado
- **Cancelado**: Projeto cancelado

## Sistema de Tarefas

### Criar Nova Tarefa

1. No menu lateral, clique em "Tarefas"
2. Clique em "Nova Tarefa"
3. Preencha as informações:
   - **Título**: Nome da tarefa
   - **Descrição**: Descrição detalhada
   - **Projeto**: Projeto relacionado
   - **Responsável**: Usuário responsável
   - **Tarefa Pai**: Para criar subtarefa (opcional)
   - **Status**: Status inicial (geralmente "A Fazer")
   - **Prioridade**: Baixa, Média, Alta ou Urgente
   - **Estimativa**: Horas estimadas
   - **Data de Vencimento**: Prazo para conclusão
4. Clique em "Salvar"

### Gerenciar Tarefas

#### Alterar Status
1. Na lista de tarefas, clique na tarefa
2. Altere o status conforme o progresso:
   - **A Fazer**: Tarefa não iniciada
   - **Em Progresso**: Tarefa sendo executada
   - **Em Revisão**: Tarefa aguardando revisão
   - **Concluída**: Tarefa finalizada
   - **Cancelada**: Tarefa cancelada

#### Adicionar Comentários
1. Na página da tarefa, vá para a seção "Comentários"
2. Digite seu comentário
3. Clique em "Adicionar Comentário"

#### Anexar Arquivos
1. Na página da tarefa, vá para a seção "Anexos"
2. Clique em "Adicionar Arquivo"
3. Selecione o arquivo e clique em "Upload"

### Subtarefas

Para criar uma hierarquia de tarefas:
1. Crie a tarefa principal
2. Ao criar uma nova tarefa, selecione a tarefa principal no campo "Tarefa Pai"
3. A subtarefa aparecerá aninhada na lista

## Time Tracking

### Iniciar Timer

1. Na página de tarefas, clique no ícone de "Play" na tarefa desejada
2. Ou vá para "Time Tracking" e clique em "Iniciar Timer"
3. Selecione a tarefa e adicione uma descrição
4. Clique em "Iniciar"

### Parar Timer

1. Clique no ícone de "Stop" na tarefa ativa
2. Ou vá para "Time Tracking" e clique em "Parar Timer"
3. Revise as informações e clique em "Parar"

### Registro Manual de Tempo

1. Vá para "Time Tracking"
2. Clique em "Adicionar Tempo Manual"
3. Preencha:
   - **Tarefa**: Tarefa relacionada
   - **Descrição**: O que foi feito
   - **Data/Hora Início**: Quando começou
   - **Data/Hora Fim**: Quando terminou
   - **Faturável**: Se deve ser cobrado
   - **Taxa Horária**: Valor por hora (se diferente do padrão)
4. Clique em "Salvar"

### Aprovar Horas

*Para gestores e administradores:*

1. Vá para "Time Tracking"
2. Na aba "Pendentes de Aprovação"
3. Revise cada entrada de tempo
4. Clique em "Aprovar" ou "Rejeitar"
5. Adicione comentários se necessário

## Contratos

*Disponível para: Admin, Employee*

### Criar Novo Contrato

1. No menu lateral, clique em "Contratos"
2. Clique em "Novo Contrato"
3. Preencha as informações:
   - **Empresa**: Empresa cliente
   - **Projeto**: Projeto relacionado (opcional)
   - **Título**: Título do contrato
   - **Conteúdo**: Texto completo do contrato
   - **Valor Total**: Valor do contrato
   - **Status**: Status inicial (geralmente "Rascunho")
4. Clique em "Salvar"

### Enviar Contrato para Assinatura

1. Na lista de contratos, clique no contrato desejado
2. Revise o conteúdo
3. Clique em "Enviar para Assinatura"
4. O status mudará para "Enviado"

### Assinar Contrato

*Para clientes:*

1. Acesse o link recebido por email
2. Revise o contrato
3. Clique em "Assinar Contrato"
4. O status mudará para "Assinado"

### Status de Contratos

- **Rascunho**: Contrato em elaboração
- **Enviado**: Contrato enviado para assinatura
- **Assinado**: Contrato assinado pelo cliente
- **Cancelado**: Contrato cancelado

## Faturamento

*Disponível para: Admin, Employee*

### Criar Nova Fatura

1. No menu lateral, clique em "Faturas"
2. Clique em "Nova Fatura"
3. Preencha as informações:
   - **Empresa**: Empresa cliente
   - **Projeto**: Projeto relacionado (opcional)
   - **Número**: Número da fatura (gerado automaticamente)
   - **Descrição**: Descrição da fatura
   - **Data de Vencimento**: Prazo para pagamento
   - **Taxa de Imposto**: Percentual de impostos
4. Adicione itens à fatura:
   - **Descrição**: Descrição do item
   - **Quantidade**: Quantidade
   - **Preço Unitário**: Valor por unidade
5. Clique em "Salvar"

### Enviar Fatura

1. Na lista de faturas, clique na fatura desejada
2. Revise os dados
3. Clique em "Enviar Fatura"
4. A fatura será enviada por email para o cliente

### Marcar como Paga

1. Na lista de faturas, clique na fatura paga
2. Clique em "Marcar como Paga"
3. Adicione informações de pagamento se necessário

### Status de Faturas

- **Rascunho**: Fatura em elaboração
- **Enviada**: Fatura enviada para o cliente
- **Paga**: Fatura paga pelo cliente
- **Vencida**: Fatura com prazo vencido
- **Cancelada**: Fatura cancelada

## Portal do Cliente

*Disponível para: Client*

### Dashboard do Cliente

O portal do cliente oferece uma visão simplificada:
- **Projetos**: Seus projetos em andamento
- **Progresso**: Status de cada projeto
- **Faturas**: Faturas pendentes e pagas
- **Contratos**: Contratos para assinatura
- **Atividades**: Últimas atividades nos projetos

### Visualizar Projetos

1. No portal do cliente, clique em "Projetos"
2. Veja a lista de seus projetos
3. Clique em um projeto para ver detalhes:
   - **Progresso**: Percentual concluído
   - **Tarefas**: Lista de tarefas do projeto
   - **Equipe**: Membros trabalhando no projeto
   - **Cronograma**: Datas importantes

### Acompanhar Atividades

1. Clique em "Atividades"
2. Veja o relatório de horas trabalhadas
3. Filtre por período ou projeto
4. Veja quais tarefas foram concluídas

### Gerenciar Contratos e Faturas

1. **Contratos**: Visualize e assine contratos pendentes
2. **Faturas**: Veja faturas pendentes e histórico de pagamentos
3. **Downloads**: Baixe documentos em PDF

## Notificações

### Centro de Notificações

1. Clique no ícone de sino no topo da página
2. Veja suas notificações recentes
3. Clique em uma notificação para ver detalhes

### Tipos de Notificações

- **Tarefa Atribuída**: Quando uma tarefa é atribuída a você
- **Tarefa Concluída**: Quando uma tarefa é marcada como concluída
- **Comentário**: Quando alguém comenta em uma tarefa sua
- **Fatura**: Quando uma nova fatura é criada
- **Contrato**: Quando um contrato precisa de assinatura

### Gerenciar Notificações

1. Clique em "Marcar como Lida" para notificações individuais
2. Clique em "Marcar Todas como Lidas" para limpar todas
3. Use filtros para ver apenas não lidas

## Configurações

### Perfil do Usuário

1. Clique no seu avatar no canto superior direito
2. Selecione "Perfil"
3. Edite suas informações:
   - **Nome**: Primeiro e último nome
   - **Email**: Email de contato
   - **Telefone**: Telefone de contato
   - **Avatar**: Foto do perfil
4. Clique em "Salvar"

### Alterar Senha

1. No perfil, clique em "Alterar Senha"
2. Digite sua senha atual
3. Digite a nova senha
4. Confirme a nova senha
5. Clique em "Alterar Senha"

### Preferências de Notificação

1. No perfil, vá para "Notificações"
2. Configure quais notificações deseja receber:
   - **Email**: Receber por email
   - **Sistema**: Receber no sistema
   - **Tipos**: Quais tipos de notificação
3. Clique em "Salvar Preferências"

## Dicas e Truques

### Atalhos de Teclado

- **Ctrl + N**: Nova tarefa
- **Ctrl + S**: Salvar (em formulários)
- **Esc**: Fechar modais
- **F**: Focar na busca

### Filtros Avançados

Use filtros para encontrar informações rapidamente:
- **Data**: Filtre por período
- **Status**: Filtre por status específico
- **Responsável**: Filtre por pessoa
- **Projeto**: Filtre por projeto

### Exportar Dados

1. Na maioria das listas, clique em "Exportar"
2. Escolha o formato (CSV, PDF, Excel)
3. Configure os filtros desejados
4. Clique em "Baixar"

### Busca Global

1. Use a barra de busca no topo
2. Digite palavras-chave
3. Veja resultados de todos os módulos
4. Clique no resultado desejado

## Solução de Problemas

### Problemas Comuns

#### Não Consigo Fazer Login
- Verifique email e senha
- Verifique se sua conta está ativa
- Tente redefinir a senha

#### Timer Não Funciona
- Verifique se não há outro timer ativo
- Atualize a página
- Verifique sua conexão com internet

#### Não Recebo Notificações
- Verifique suas preferências de notificação
- Verifique se o email não está na caixa de spam
- Verifique se as notificações do navegador estão habilitadas

### Contato para Suporte

Se você continuar tendo problemas:
- **Email**: support@pontohub.com
- **Chat**: Use o chat no canto inferior direito
- **Telefone**: +55 (11) 1234-5678
- **Horário**: Segunda a sexta, 9h às 18h

## Atualizações e Novidades

O sistema é atualizado regularmente. Para ficar por dentro:
- **Changelog**: Veja as novidades na página inicial
- **Newsletter**: Assine nossa newsletter
- **Blog**: Acompanhe nosso blog
- **Redes Sociais**: Siga-nos nas redes sociais

---

**Nota**: Este guia é atualizado conforme novas funcionalidades são adicionadas. Sempre consulte a versão mais recente online.

