import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Task, Family } from '../types';
import { apiFetchTasks, apiUpdateTaskStatus, apiCreateTask, apiFetchFamilies } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

// --- KANBAN COMPONENTS ---

const priorityClasses = {
    'Alta': 'bg-red-100 text-red-800',
    'Média': 'bg-yellow-100 text-yellow-800',
    'Baixa': 'bg-blue-100 text-blue-800',
};

const TaskCard: React.FC<{ task: Task; onUpdate: () => void, onSelect: (task: Task) => void }> = ({ task, onUpdate, onSelect }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = async (newStatus: Task['status']) => {
        if (!user?.token) return;
        try {
            await apiUpdateTaskStatus(user.token, task.id, newStatus);
            addToast(`Tarefa movida para "${newStatus}"`, 'success');
            onUpdate();
        } catch (e) {
            addToast('Erro ao atualizar tarefa', 'error');
        }
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 group transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800 break-words w-full cursor-pointer" onClick={() => onSelect(task)}>{task.titulo}</p>
                 <div className="relative dropdown" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(prev => !prev)} className="text-gray-500 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20">
                             {task.status !== 'Pendente' && <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('Pendente') }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mover para Pendente</a>}
                             {task.status !== 'Em Andamento' && <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('Em Andamento')}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mover para Em Andamento</a>}
                             {task.status !== 'Concluido' && <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('Concluido')}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mover para Concluído</a>}
                        </div>
                    )}
                </div>

            </div>
            <p className="text-sm text-gray-600 mt-2 cursor-pointer" onClick={() => onSelect(task)}>{task.descricao.substring(0, 70)}...</p>
            <div className="flex items-center justify-between mt-3 text-xs">
                <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${priorityClasses[task.prioridade]}`}>
                    {task.prioridade}
                </span>
                <span className="text-gray-500">{task.dataCriacao}</span>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ title: string; tasks: Task[]; onUpdate: () => void, onSelectTask: (task: Task) => void }> = ({ title, tasks, onUpdate, onSelectTask }) => {
    return (
        <div className="bg-gray-100 rounded-lg p-3 w-full md:w-1/3 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 px-1 text-lg">{title} <span className="text-sm font-medium text-gray-500">{tasks.length}</span></h3>
            <div className="flex-grow overflow-y-auto">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={onUpdate} onSelect={onSelectTask}/>
                ))}
            </div>
        </div>
    );
};

const KanbanView: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { user } = useAuth();

    const fetchAndSetTasks = useCallback(() => {
        if (user?.token) {
            apiFetchTasks(user.token).then(setTasks);
        }
    }, [user?.token]);
    
    useEffect(() => {
        fetchAndSetTasks();
    }, [fetchAndSetTasks]);

    const columns: { title: Task['status'], tasks: Task[] }[] = [
        { title: 'Pendente', tasks: tasks.filter(t => t.status === 'Pendente') },
        { title: 'Em Andamento', tasks: tasks.filter(t => t.status === 'Em Andamento') },
        { title: 'Concluido', tasks: tasks.filter(t => t.status === 'Concluido') }
    ];

    return (
        <>
            <div className="flex justify-end mb-6">
                 <button onClick={() => setCreateModalOpen(true)} className="bg-brand-primary-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary-800 transition-colors flex items-center space-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Nova Tarefa</span>
                </button>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                {columns.map(col => (
                    <KanbanColumn key={col.title} title={col.title} tasks={col.tasks} onUpdate={fetchAndSetTasks} onSelectTask={setSelectedTask} />
                ))}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Nova Tarefa">
                <CreateTaskForm onTaskCreated={() => { fetchAndSetTasks(); setCreateModalOpen(false); }} onClose={() => setCreateModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask?.titulo || ''}>
                {selectedTask && <TaskDetails task={selectedTask} />}
            </Modal>
        </>
    );
};

const CreateTaskForm: React.FC<{ onTaskCreated: () => void, onClose: () => void }> = ({ onTaskCreated, onClose }) => {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !titulo) return;
        try {
            await apiCreateTask(user.token, { titulo, descricao, prioridade, status: 'Pendente' });
            addToast('Nova tarefa criada com sucesso!', 'success');
            onTaskCreated();
        } catch {
            addToast('Falha ao criar tarefa.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500"></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select value={prioridade} onChange={e => setPrioridade(e.target.value as any)} className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500">
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="py-2 px-4 bg-brand-primary-900 text-white rounded-md hover:bg-brand-primary-800">Criar Tarefa</button>
            </div>
        </form>
    )
}

const TaskDetails: React.FC<{task: Task}> = ({task}) => (
    <div className="space-y-4">
        <p><strong className="font-semibold text-gray-600">Descrição:</strong><br/>{task.descricao}</p>
        <p><strong className="font-semibold text-gray-600">Status:</strong> {task.status}</p>
        <p><strong className="font-semibold text-gray-600">Prioridade:</strong> <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${priorityClasses[task.prioridade]}`}>{task.prioridade}</span></p>
        <p><strong className="font-semibold text-gray-600">Família Associada:</strong> {task.familiaAssociada || 'N/A'}</p>
        <p><strong className="font-semibold text-gray-600">Data de Criação:</strong> {task.dataCriacao}</p>
    </div>
)

// --- FAMILY MANAGEMENT COMPONENTS ---

const FamilyListView: React.FC = () => {
    const [families, setFamilies] = useState<Family[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if(user?.token) {
            apiFetchFamilies(user.token).then(setFamilies);
        }
    }, [user?.token]);

    const filteredFamilies = families.filter(family => 
        family.nome_responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.cpf_responsavel.includes(searchTerm)
    );
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <input 
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Responsável</th>
                            <th scope="col" className="px-6 py-3">CPF</th>
                            <th scope="col" className="px-6 py-3">Bairro</th>
                            <th scope="col" className="px-6 py-3">Membros</th>
                            <th scope="col" className="px-6 py-3">CadÚnico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFamilies.map(family => (
                            <tr key={family.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{family.nome_responsavel}</th>
                                <td className="px-6 py-4">{family.cpf_responsavel}</td>
                                <td className="px-6 py-4">{family.bairro}</td>
                                <td className="px-6 py-4">{family.membros}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 font-semibold text-xs rounded-full ${family.cadunico_atualizado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {family.cadunico_atualizado ? 'Atualizado' : 'Pendente'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---

const ServerDashboardPage: React.FC = () => {
    type Tab = 'tasks' | 'families';
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    
    const tabs = [
        { id: 'tasks', label: 'Painel de Tarefas', component: <KanbanView /> },
        { id: 'families', label: 'Famílias', component: <FamilyListView /> },
    ];
    
    return (
        <div className="animate-slide-in">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800">Painel do Servidor</h2>
            </div>
           
            <div className="mb-6 bg-white p-2 rounded-lg shadow-sm flex space-x-1 sm:space-x-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm sm:text-base ${activeTab === tab.id ? 'bg-brand-primary-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div>
                {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
        </div>
    );
};

export default ServerDashboardPage;