import type { User, Task, Course, ForumPost, Job, Family, SecretaryStats } from '../types';

// --- MOCK DATABASE ---
const mockUsers: { [key: string]: User } = {
  '11122233344': { id: 1, nome: 'Ana Silva (Servidora)', cpf: '11122233344', cargo: 'servidor', pontos: 0, nivel: 1, pontosProximoNivel: 100, enrolledCourses: [], appliedJobs: [] },
  '55566677788': { id: 2, nome: 'João Souza (Beneficiário)', cpf: '55566677788', cargo: 'beneficiario', pontos: 125, nivel: 2, pontosProximoNivel: 300, enrolledCourses: [2], appliedJobs: [1] },
  '99988877766': { id: 3, nome: 'Mariana Costa (Secretária)', cpf: '99988877766', cargo: 'secretario', pontos: 0, nivel: 1, pontosProximoNivel: 100, enrolledCourses: [], appliedJobs: [] },
};

let mockTasks: Task[] = [
  { id: 1, titulo: 'Revisar cadastro Família Oliveira', descricao: 'Verificar documentos pendentes e atualizar o endereço no sistema.', status: 'Pendente', servidor_id: 1, prioridade: 'Alta', familiaAssociada: 'Família Oliveira', dataCriacao: '2023-10-26' },
  { id: 2, titulo: 'Contato com CRAS sobre o caso X', descricao: 'Agendar visita domiciliar para a próxima semana.', status: 'Em Andamento', servidor_id: 1, prioridade: 'Média', familiaAssociada: 'Caso X', dataCriacao: '2023-10-25' },
  { id: 3, titulo: 'Finalizar relatório mensal', descricao: 'Compilar dados de atendimento do mês de Outubro.', status: 'Concluido', servidor_id: 1, prioridade: 'Baixa', dataCriacao: '2023-10-20' },
  { id: 4, titulo: 'Acompanhamento do Sr. José', descricao: 'Ligar para verificar a situação e agendar retorno.', status: 'Pendente', servidor_id: 1, prioridade: 'Média', familiaAssociada: 'Sr. José', dataCriacao: '2023-10-27' },
];

const mockCourses: Course[] = [
    { id: 1, titulo: 'Curso de Informática Básica', descricao: 'Aprenda o essencial de computadores e internet.', categoria: 'Tecnologia' },
    { id: 2, titulo: 'Oficina de Culinária Saudável', descricao: 'Receitas fáceis e nutritivas para o dia a dia.', categoria: 'Saúde' },
    { id: 3, titulo: 'Capacitação para Empreendedores', descricao: 'Como iniciar e gerir seu próprio negócio.', categoria: 'Negócios' },
];

let mockForumPosts: ForumPost[] = [
    { id: 1, titulo: 'Dúvida sobre o Bolsa Família', conteudo: 'Alguém sabe quando sai o próximo pagamento?', autor_nome: 'Maria Pereira', data: '2023-10-26', respostas: 5, curtidas: 12 },
    { id: 2, titulo: 'Oportunidade de trabalho voluntário', conteudo: 'Estou procurando voluntários para um evento na comunidade no próximo sábado.', autor_nome: 'Carlos Andrade', data: '2023-10-25', respostas: 2, curtidas: 8 },
];

const mockJobs: Job[] = [
    { id: 1, titulo: 'Auxiliar de Limpeza', empresa: 'Supermercado Preço Bom', descricao: 'Vaga para período integral. Requer experiência mínima de 6 meses.', localidade: 'Centro', tipo: 'Integral' },
    { id: 2, titulo: 'Atendente de Loja', empresa: 'Varejo & Cia', descricao: 'Vaga de 6h/dia. Boa comunicação é essencial.', localidade: 'Bairro Sul', tipo: 'Meio Período' },
    { id: 3, titulo: 'Desenvolvedor Web Jr (Remoto)', empresa: 'Tech Solutions', descricao: 'Oportunidade para iniciantes em desenvolvimento web. Conhecimento em React é um diferencial.', localidade: 'Remoto', tipo: 'Remoto' },
];

const mockFamilies: Family[] = [
    { id: 1, nome_responsavel: 'Fernanda Oliveira', cpf_responsavel: '12345678901', renda_familiar: 1200.50, bairro: 'Centro', membros: 4, cadunico_atualizado: true, data_cadastro: '2023-01-15' },
    { id: 2, nome_responsavel: 'Ricardo Santos', cpf_responsavel: '23456789012', renda_familiar: 850.00, bairro: 'Vila Nova', membros: 3, cadunico_atualizado: false, data_cadastro: '2022-11-30' },
    { id: 3, nome_responsavel: 'Camila Lima', cpf_responsavel: '34567890123', renda_familiar: 2100.00, bairro: 'Jardim das Flores', membros: 5, cadunico_atualizado: true, data_cadastro: '2023-05-20' },
];


// --- MOCK API FUNCTIONS ---
const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));
}

export const apiLogin = (cpf: string, senha: string): Promise<{ access_token: string, token_type: 'bearer' }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockUsers[cpf] && senha === 'senha123') { // Simple password check
                resolve({ access_token: `fake-jwt-for-${cpf}`, token_type: 'bearer' });
            } else {
                reject(new Error('CPF ou senha incorretos'));
            }
        }, 500);
    });
};

export const apiFetchProfile = (token: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const cpf = token.replace('fake-jwt-for-', '');
            const user = mockUsers[cpf];
            if (user) {
                resolve(JSON.parse(JSON.stringify(user)));
            } else {
                reject(new Error('Usuário não encontrado'));
            }
        }, 200);
    });
}

export const apiFetchTasks = (token: string): Promise<Task[]> => {
    return simulateNetworkDelay(mockTasks);
};

export const apiUpdateTaskStatus = (token: string, taskId: number, status: Task['status']): Promise<Task> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const taskIndex = mockTasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                mockTasks[taskIndex].status = status;
                resolve(JSON.parse(JSON.stringify(mockTasks[taskIndex])));
            } else {
                reject(new Error('Tarefa não encontrada'));
            }
        }, 300);
    });
}

export const apiCreateTask = (token: string, taskData: Omit<Task, 'id' | 'servidor_id' | 'dataCriacao'>): Promise<Task> => {
     return new Promise((resolve) => {
        const newTask: Task = {
            ...taskData,
            id: Date.now(),
            servidor_id: 1, // Mocked server ID
            dataCriacao: new Date().toISOString().split('T')[0],
        };
        mockTasks.unshift(newTask);
        setTimeout(() => resolve(newTask), 500);
    });
}


export const apiFetchCourses = (): Promise<Course[]> => {
    return simulateNetworkDelay(mockCourses);
};

export const apiEnrollCourse = (token: string, courseId: number): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
       const cpf = token.replace('fake-jwt-for-', '');
       const user = mockUsers[cpf];
       if (user) {
           if (!user.enrolledCourses.includes(courseId)) {
               user.enrolledCourses.push(courseId);
           }
           resolve({ message: 'Inscrição realizada com sucesso!' });
       } else {
           reject(new Error('Usuário não encontrado'));
       }
    });
}

export const apiFetchForumPosts = (): Promise<ForumPost[]> => {
    return simulateNetworkDelay(mockForumPosts);
};

export const apiCreateForumPost = (token: string, titulo: string, conteudo: string): Promise<ForumPost> => {
    return new Promise((resolve) => {
        const cpf = token.replace('fake-jwt-for-', '');
        const user = mockUsers[cpf];
        const newPost: ForumPost = {
            id: Date.now(),
            titulo,
            conteudo,
            autor_nome: user.nome.split(' ')[0],
            data: new Date().toISOString().split('T')[0],
            respostas: 0,
            curtidas: 0
        };
        mockForumPosts.unshift(newPost);
        setTimeout(() => resolve(newPost), 500);
    });
}

export const apiFetchJobs = (): Promise<Job[]> => {
    return simulateNetworkDelay(mockJobs);
};

export const apiApplyForJob = (token: string, jobId: number): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
       const cpf = token.replace('fake-jwt-for-', '');
       const user = mockUsers[cpf];
       if (user) {
           if (!user.appliedJobs.includes(jobId)) {
               user.appliedJobs.push(jobId);
           }
           resolve({ message: 'Candidatura enviada com sucesso!' });
       } else {
           reject(new Error('Usuário não encontrado'));
       }
    });
};

export const apiFetchFamilies = (token: string): Promise<Family[]> => {
    return simulateNetworkDelay(mockFamilies);
};

export const apiFetchSecretaryStats = (token: string): Promise<SecretaryStats> => {
    const stats: SecretaryStats = {
        totalBeneficiarios: Object.values(mockUsers).filter(u => u.cargo === 'beneficiario').length,
        totalFamilias: mockFamilies.length,
        tarefasConcluidasMes: mockTasks.filter(t => t.status === 'Concluido').length, // Simplified
        mediaEngajamentoCursos: 78,
        tasksByStatus: [
            { name: 'Pendente', value: mockTasks.filter(t => t.status === 'Pendente').length },
            { name: 'Em Andamento', value: mockTasks.filter(t => t.status === 'Em Andamento').length },
            { name: 'Concluído', value: mockTasks.filter(t => t.status === 'Concluido').length },
        ],
        coursesByCategory: [
            { name: 'Tecnologia', value: 15 },
            { name: 'Saúde', value: 25 },
            { name: 'Negócios', value: 18 },
        ],
        recentActivity: [
            {id: 1, text: 'João Souza se inscreveu no curso de Culinária.', time: '2 min atrás', type: 'course'},
            {id: 2, text: 'Nova tarefa "Visita Domiciliar" criada por Ana Silva.', time: '15 min atrás', type: 'task'},
            {id: 3, text: 'Nova família "Santos" cadastrada no sistema.', time: '1 hora atrás', type: 'user'},
            {id: 4, text: 'Tarefa "Relatório Mensal" foi concluída.', time: '3 horas atrás', type: 'task'},
        ]
    }
    return simulateNetworkDelay(stats);
}
