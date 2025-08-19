import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Appointment as Task } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Clock, User, Tag, Calendar } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';

// --- KANBAN COMPONENTS ---

const priorityClasses: { [key: string]: string } = {
    'Alta': 'bg-red-100 text-red-800 border-red-200',
    'Média': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Baixa': 'bg-green-100 text-green-800 border-green-200',
};

const TaskCard: React.FC<{ task: Task; onUpdate: () => void, onSelect: (task: Task) => void }> = ({ task, onUpdate, onSelect }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = async (newStatus: Task['status']) => {
        if (!user?.token) return;
        try {
            await api.patch(`/appointments/${task.id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            addToast(`Tarefa movida para "${newStatus}"`, 'success');
            onUpdate();
        } catch (e) {
            addToast('Erro ao atualizar tarefa', 'error');
            console.error(e);
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
        exit: { y: -20, opacity: 0 }
    };

    return (
        <motion.div 
            variants={cardVariants}
            layout
            className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-200 group transition-shadow hover:shadow-md cursor-pointer"
            onClick={() => onSelect(task)}
        >
            <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800 break-words w-full pr-2">{task.title}</p>
                 <div className="relative dropdown" ref={dropdownRef}>
                    <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(prev => !prev); }} className="text-gray-400 hover:text-gray-700 p-1 rounded-full">
                         <MoreHorizontal size={20} />
                    </button>
                    <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 border"
                        >
                             {task.status !== 'Pendente' && <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange('Pendente') }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">Mover para Pendente</a>}
                             {task.status !== 'Em Andamento' && <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange('Em Andamento')}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mover para Em Andamento</a>}
                             {task.status !== 'Realizado' && <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange('Realizado')}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg">Mover para Realizado</a>}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{task.description.substring(0, 70)}...</p>
            <div className="flex items-center justify-between mt-4 text-xs">
                <span className={`px-2.5 py-1 font-medium leading-tight rounded-full border ${priorityClasses[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(task.date).toLocaleDateString()}</span>
                </div>
            </div>
        </motion.div>
    );
};

const KanbanColumn: React.FC<{ title: string; tasks: Task[]; onUpdate: () => void, onSelectTask: (task: Task) => void }> = ({ title, tasks, onUpdate, onSelectTask }) => {
    const columnVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };
    return (
        <motion.div 
            variants={columnVariants}
            className="bg-gray-50/80 rounded-xl p-4 w-full md:w-1/3 flex flex-col border"
        >
            <h3 className="font-bold text-gray-800 mb-4 px-1 text-lg">{title} <span className="text-sm font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">{tasks.length}</span></h3>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <AnimatePresence>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdate={onUpdate} onSelect={onSelectTask}/>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

type FormInputs = {
    title: string;
    description: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    beneficiary_id: number;
    date: string;
};

const CreateTaskForm: React.FC<{ onTaskCreated: () => void, closeModal: () => void }> = ({ onTaskCreated, closeModal }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormInputs>();
    const { addToast } = useToast();
    const { user } = useAuth();
    const [beneficiaries, setBeneficiaries] = useState<{id: number, name: string}[]>([]);

    useEffect(() => {
        const fetchBeneficiaries = async () => {
            try {
                const response = await api.get('/beneficiaries');
                setBeneficiaries(response.data.data);
            } catch (error) {
                console.error("Failed to fetch beneficiaries", error);
                addToast("Erro ao carregar beneficiários", 'error');
            }
        };
        fetchBeneficiaries();
    }, [addToast]);

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        if (!user?.token) {
            addToast("Autenticação necessária", 'error');
            return;
        }
        try {
            const appointmentData = {
                ...data,
                beneficiary_id: Number(data.beneficiary_id),
            };
            await api.post('/appointments', appointmentData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            addToast("Agendamento criado com sucesso!", 'success');
            onTaskCreated();
            closeModal();
        } catch (error) {
            console.error("Failed to create appointment:", error);
            addToast("Erro ao criar agendamento", 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                <input {...register("title", { required: "Título é obrigatório" })} id="title" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea {...register("description", { required: "Descrição é obrigatória" })} id="description" rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm"></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <label htmlFor="beneficiary_id" className="block text-sm font-medium text-gray-700">Associar ao Beneficiário</label>
                <select {...register("beneficiary_id", { required: "Selecione um beneficiário" })} id="beneficiary_id" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm">
                    <option value="">Selecione...</option>
                    {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.beneficiary_id && <p className="text-red-500 text-xs mt-1">{errors.beneficiary_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridade</label>
                    <select {...register("priority", { required: "Prioridade é obrigatória" })} id="priority" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm">
                        <option>Baixa</option>
                        <option>Média</option>
                        <option>Alta</option>
                    </select>
                    {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" {...register("date", { required: "Data é obrigatória" })} id="date" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm" />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-prefeitura-azul hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-prefeitura-azul disabled:opacity-50">
                    {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
                </button>
            </div>
        </form>
    );
};

const TaskDetailModal: React.FC<{ task: Task, onClose: () => void }> = ({ task, onClose }) => {
    return (
        <Modal isOpen={!!task} onClose={onClose} title="Detalhes do Agendamento">
            <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                <p className="text-base">{task.description}</p>
                <hr/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-prefeitura-azul" />
                        <strong>Prioridade:</strong>
                        <span className={`px-2.5 py-1 font-medium leading-tight rounded-full border text-xs ${priorityClasses[task.priority]}`}>{task.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-prefeitura-azul" />
                        <strong>Status:</strong>
                        <span>{task.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-prefeitura-azul" />
                        <strong>Data:</strong>
                        <span>{new Date(task.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-prefeitura-azul" />
                        <strong>Beneficiário:</strong>
                        <span>{task.beneficiary_name || 'Não informado'}</span>
                    </div>
                </div>
                 <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        Fechar
                    </button>
                </div>
            </div>
        </Modal>
    )
}

const ServerDashboardPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { user } = useAuth();
    const { addToast } = useToast();

    const fetchAndSetTasks = useCallback(async () => {
        if (user?.token) {
            try {
                const response = await api.get('/appointments/server', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setTasks(response.data.data);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
                addToast("Erro ao buscar agendamentos", 'error');
            }
        }
    }, [user?.token, addToast]);

    useEffect(() => {
        fetchAndSetTasks();
    }, [fetchAndSetTasks]);

    const tasksPendente = tasks.filter(t => t.status === 'Pendente');
    const tasksEmAndamento = tasks.filter(t => t.status === 'Em Andamento');
    const tasksConcluido = tasks.filter(t => t.status === 'Realizado');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 lg:p-8"
        >
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h2 className="text-4xl font-bold text-gray-800">Meu Painel</h2>
                <div className="flex items-center gap-4">
                    <Link to="/admin/beneficiaries" className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm border transition-transform transform hover:scale-105 flex items-center gap-2">
                        <User size={18} /> Ver Beneficiários
                    </Link>
                    <button onClick={() => setCreateModalOpen(true)} className="bg-prefeitura-azul hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-transform transform hover:scale-105 flex items-center gap-2">
                        <Plus size={18} /> Novo Agendamento
                    </button>
                </div>
            </header>

            <motion.div 
                className="flex flex-col md:flex-row gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.2 } }
                }}
            >
                <KanbanColumn title="Pendente" tasks={tasksPendente} onUpdate={fetchAndSetTasks} onSelectTask={setSelectedTask} />
                <KanbanColumn title="Em Andamento" tasks={tasksEmAndamento} onUpdate={fetchAndSetTasks} onSelectTask={setSelectedTask} />
                <KanbanColumn title="Realizado" tasks={tasksConcluido} onUpdate={fetchAndSetTasks} onSelectTask={setSelectedTask} />
            </motion.div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Novo Agendamento">
                        <CreateTaskForm 
                            onTaskCreated={fetchAndSetTasks}
                            closeModal={() => setCreateModalOpen(false)}
                        />
                    </Modal>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ServerDashboardPage;