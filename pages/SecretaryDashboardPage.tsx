import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { SecretaryStats } from '../types';
import { Link } from 'react-router-dom';
import NewsManager from '../components/NewsManager';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, CheckSquare, BarChart2, Newspaper, FileText } from 'lucide-react';

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode, color: string, bgColor: string}> = ({ title, value, icon, color, bgColor }) => (
    <motion.div 
        className={`p-6 rounded-2xl shadow-lg flex items-center space-x-4 ${bgColor} border border-gray-200`}
        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </motion.div>
);

const ActivityItem: React.FC<{ activity: { id: number, text: string, time: string, type: 'user' | 'task' | 'course' } }> = ({ activity }) => {
    const icons = {
        user: <Users size={20} className="text-blue-500" />,
        task: <CheckSquare size={20} className="text-green-500" />,
        course: <Newspaper size={20} className="text-yellow-500" />
    }
    return (
        <motion.div 
            className="flex items-start space-x-4 py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-gray-100 p-3 rounded-full">{icons[activity.type]}</div>
            <div>
                <p className="text-sm text-gray-800">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
        </motion.div>
    )
}

const SecretaryDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<SecretaryStats | null>(null);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Usando a nova rota de estatísticas
                const response = await api.get('/reports/stats');
                // Mapeando os dados para o formato esperado pelo frontend, se necessário
                const fetchedStats = response.data.data;
                setStats({
                    totalBeneficiarios: fetchedStats.totalBeneficiaries,
                    totalFamilias: fetchedStats.totalFamilies || 0, // Adicionar se disponível na API
                    tarefasConcluidasMes: fetchedStats.appointmentsByStatus?.find(s => s.status === 'Realizado')?.count || 0,
                    mediaEngajamentoCursos: fetchedStats.courseEngagement || 0, // Adicionar se disponível
                    tasksByStatus: fetchedStats.appointmentsByStatus?.map(s => ({ name: s.status, value: s.count })) || [],
                    coursesByCategory: fetchedStats.beneficiariesByProgram?.map(p => ({ name: p.name, value: p.count })) || [],
                    recentActivity: fetchedStats.recentActivity || [] // Adicionar se disponível
                });
            } catch (error) {
                console.error("Failed to fetch secretary stats:", error);
            }
        };

        if(user?.token) {
            fetchStats();
        }
    }, [user]);

    if (!stats) {
        return <div className="text-center p-10 font-semibold text-gray-600">Carregando dados da secretaria...</div>;
    }
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
        >
             <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <h2 className="text-4xl font-bold text-gray-800">Painel da Secretaria</h2>
                 <nav className="flex flex-wrap gap-3">
                    <Link to="/admin/beneficiaries" className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm border transition-transform transform hover:scale-105">
                        <Users size={18} /> Gerenciar Beneficiários
                    </Link>
                    <Link to="/admin/programs" className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm border transition-transform transform hover:scale-105">
                        <FileText size={18} /> Gerenciar Programas
                    </Link>
                    <Link to="/admin/reports" className="flex items-center gap-2 bg-prefeitura-azul hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-transform transform hover:scale-105">
                        <BarChart2 size={18} /> Ver Relatórios
                    </Link>
                 </nav>
            </header>
            
            <motion.section 
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
                <StatCard title="Total de Beneficiários" value={stats.totalBeneficiarios} color="text-blue-500 bg-blue-100" bgColor="bg-white" icon={<Users size={24} />} />
                <StatCard title="Total de Famílias" value={stats.totalFamilias} color="text-green-500 bg-green-100" bgColor="bg-white" icon={<Home size={24} />} />
                <StatCard title="Atendimentos Realizados" value={stats.tarefasConcluidasMes} color="text-purple-500 bg-purple-100" bgColor="bg-white" icon={<CheckSquare size={24} />} />
                <StatCard title="Programas Ativos" value={stats.coursesByCategory.length} color="text-yellow-500 bg-yellow-100" bgColor="bg-white" icon={<BarChart2 size={24} />} />
            </motion.section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-4">Beneficiários por Programa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.coursesByCategory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip wrapperClassName="!bg-white !border !border-gray-200 !rounded-lg !shadow-xl" />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="value" name="Beneficiários" fill="#0088FE" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div 
                    className="bg-white p-6 rounded-2xl shadow-lg border"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-4">Status dos Atendimentos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.tasksByStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {stats.tasksByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip wrapperClassName="!bg-white !border !border-gray-200 !rounded-lg !shadow-xl" />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                    className="bg-white p-6 rounded-2xl shadow-lg border"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Atividade Recente</h3>
                     <div className="divide-y divide-gray-100">
                        {stats.recentActivity.length > 0 
                            ? stats.recentActivity.map(act => <ActivityItem key={act.id} activity={act} />)
                            : <p className="text-center text-gray-500 py-4">Nenhuma atividade recente.</p>
                        }
                     </div>
                </motion.div>
                <motion.div 
                    className="bg-white p-6 rounded-2xl shadow-lg border"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    <NewsManager />
                </motion.div>
            </section>
        </motion.div>
    );
};

export default SecretaryDashboardPage;
