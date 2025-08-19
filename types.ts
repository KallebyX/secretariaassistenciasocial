export interface User {
  id: number;
  nome: string;
  cpf: string;
  cargo: 'beneficiario' | 'servidor' | 'coordenador' | 'secretario';
  pontos: number;
  nivel: number;
  pontosProximoNivel: number;
  token?: string;
  enrolledCourses: number[];
  appliedJobs: number[];
}

export interface Task {
  id: number;
  titulo: string;
  descricao: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
  servidor_id: number;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  familiaAssociada?: string;
  dataCriacao: string;
}

export interface Course {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
}

export interface ForumPost {
    id: number;
    titulo: string;
    conteudo: string;
    autor_nome: string;
    data: string;
    respostas: number;
    curtidas: number;
}

export interface Job {
    id: number;
    titulo: string;
    empresa: string;
    descricao: string;
    localidade: string;
    tipo: 'Integral' | 'Meio Período' | 'Remoto';
}

export interface Family {
    id: number;
    nome_responsavel: string;
    cpf_responsavel: string;
    renda_familiar: number;
    bairro: string;
    membros: number;
    cadunico_atualizado: boolean;
    data_cadastro: string;
}

export interface SecretaryStats {
    totalBeneficiarios: number;
    totalFamilias: number;
    tarefasConcluidasMes: number;
    mediaEngajamentoCursos: number; // as percentage
    tasksByStatus: { name: string, value: number }[];
    coursesByCategory: { name: string, value: number }[];
    recentActivity: { id: number, text: string, time: string, type: 'user' | 'task' | 'course' }[];
}
