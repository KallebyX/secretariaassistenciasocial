# To-Do List: Ecossistema da Secretaria de Assistência Social

Este documento delineia o plano de desenvolvimento para o sistema completo da Secretaria de Assistência Social, organizado em fases.

---

### **Fase 1: Gestão de Beneficiários (O Coração do Sistema)**
- [x] **Backend:**
  - [x] Criar modelo de dados do Beneficiário (Nome, CPF, NIS, Endereço, Contato, etc.).
  - [x] Implementar endpoints da API (CRUD - Create, Read, Update, Delete) para beneficiários.
  - [ ] Implementar lógica de busca e filtragem no backend.
- [x] **Frontend (Visão do Servidor/Secretário):**
  - [x] Criar a página `BeneficiaryListPage.tsx` para exibir todos os beneficiários em uma tabela.
  - [ ] Implementar componentes de UI de busca e filtro na página de listagem.
  - [x] Criar a página `BeneficiaryProfilePage.tsx` para mostrar informações detalhadas de um único beneficiário.
  - [x] Criar o componente `BeneficiaryForm.tsx` (para criação e edição) com validação de entrada.
  - [x] Integrar os componentes do frontend com a API do backend.
  - [x] Adicionar um link/seção em `ServerDashboardPage.tsx` e `SecretaryDashboardPage.tsx` para acessar a Gestão de Beneficiários.

---

### **Fase 2: Gestão de Programas e Serviços**
- [ ] **Backend:**
  - [ ] Criar modelo de dados do Programa (Nome, Descrição, Critérios de Elegibilidade).
  - [ ] Criar endpoints da API para operações CRUD em Programas.
  - [ ] Criar uma tabela/lógica de ligação para associar Beneficiários a Programas.
  - [ ] Criar modelo de Serviço/Atendimento (ex: 'Visita', 'Solicitação de Documento').
  - [ ] API para registrar novos serviços/atendimentos para um beneficiário.
- [ ] **Frontend:**
  - [ ] UI para Gerenciamento de Programas (CRUD).
  - [ ] Na `BeneficiaryProfilePage.tsx`, adicionar uma seção para visualizar/adicionar/remover o beneficiário de programas.
  - [ ] Na `BeneficiaryProfilePage.tsx`, adicionar uma linha do tempo/histórico de serviços/atendimentos.
  - [ ] Criar um `AttendanceLogForm.tsx` para os servidores registrarem novas interações.

---

### **Fase 3: Comunicação e Gestão de Conteúdo**
- [ ] **Backend:**
  - [ ] Criar modelo de dados de Notícia/Artigo (Título, Conteúdo, Autor, Data de Publicação).
  - [ ] Implementar endpoints da API para operações CRUD em Notícias.
- [ ] **Frontend:**
  - [ ] Em `SecretaryDashboardPage.tsx`, criar uma seção "Gerenciar Notícias" com um formulário para criar/editar artigos.
  - [ ] Em `HomePage.tsx`, buscar e exibir as últimas notícias da API.
  - [ ] Criar uma `NewsPage.tsx` dedicada para ver todas as notícias e uma `SingleNewsPage.tsx` para artigos individuais.

---

### **Fase 4: Agendamentos e Compromissos**
- [ ] **Backend:**
  - [ ] Criar modelo de dados de Compromisso (beneficiary_id, server_id, data, hora, motivo, status).
  - [ ] Implementar API para criar, visualizar e atualizar compromissos.
- [ ] **Frontend:**
  - [ ] Criar uma visualização de calendário (`/schedule`) para os servidores verem seus compromissos.
  - [ ] Permitir que os servidores criem novos compromissos para os beneficiários.
  - [ ] Na `BeneficiaryPortalPage.tsx`, permitir que os beneficiários visualizem seus próximos compromissos.

---

### **Fase 5: Relatórios e Análises**
- [ ] **Backend:**
  - [ ] Desenvolver endpoints da API para gerar estatísticas (ex: número de beneficiários por programa, atendimentos por mês).
- [ ] **Frontend:**
  - [ ] Em `SecretaryDashboardPage.tsx`, criar um dashboard com gráficos para visualizar as estatísticas geradas.

---

### **Fase 6: Acessibilidade e Experiência do Usuário (Contínuo)**
- [ ] **Acessibilidade (A11y):**
  - [x] **(Agora)** Integrar o widget VLibras no `Layout.tsx`.
  - [ ] **(Contínuo)** Garantir que todos os componentes usem HTML semântico (`<main>`, `<nav>`, `<section>`).
  - [ ] **(Contínuo)** Garantir que todas as imagens tenham atributos `alt`.
  - [ ] **(Contínuo)** Garantir que todos os campos de formulário tenham `<label>`s associados.
  - [ ] **(Contínuo)** Garantir contraste de cor suficiente em toda a aplicação.
  - [ ] **(Contínuo)** Implementar navegação por teclado e gerenciamento de foco.
  - [ ] **(Contínuo)** Usar atributos ARIA quando necessário.
- [ ] **UI/UX:**
  - [ ] **(Contínuo)** Manter um sistema de design consistente.
  - [ ] **(Contínuo)** Adicionar estados de carregamento e mensagens de feedback para todas as ações assíncronas.
  - [ ] **(Contínuo)** Garantir que o layout seja totalmente responsivo para dispositivos móveis e desktop.
