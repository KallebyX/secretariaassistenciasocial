import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetchSecretaryStats } from '../services/api';
import type { SecretaryStats } from '../types';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode, color: string}> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`${color} p-4 rounded-full`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ title: string, data: {name: string, value: number}[], color: string }> = ({ title, data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg text-gray-700 mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-600">{item.name}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded-full">
                           <div className={`h-4 ${color} rounded-full animate-bar-grow origin-left`} style={{ width: `${(item.value / maxValue) * 100}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ActivityItem: React.FC<{ activity: SecretaryStats['recentActivity'][0] }> = ({ activity }) => {
    const icons = {
        user: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary-900" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
        task: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent-600" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
        course: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-secondary-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61V16.5a1 1 0 001.521.858l4-2.5a1 1 0 000-1.716V9.61l6.394-2.69a1 1 0 000-1.84l-7-3zM14 8.39l-3 1.265V6.39l3-1.265v3.265z" /></svg>
    }
    return (
        <div className="flex items-start space-x-3 py-3">
            <span className="bg-gray-100 p-2 rounded-full">{icons[activity.type]}</span>
            <div>
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
        </div>
    )
}


const SecretaryDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<SecretaryStats | null>(null);
    const { user } = useAuth();
    
    useEffect(() => {
        if(user?.token) {
            apiFetchSecretaryStats(user.token).then(setStats);
        }
    }, [user]);

    if (!stats) {
        return <div className="text-center p-10">Carregando dados da secretaria...</div>;
    }
    
    return (
        <div className="animate-slide-in">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800">Painel da Secretaria</h2>
                 <div className="flex gap-4">
                    <Link to="/admin/beneficiaries" className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg">
                        Gerenciar Beneficiários
                    </Link>
                    <Link to="/admin/programs" className="bg-prefeitura-amarelo hover:opacity-90 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        Gerenciar Programas
                    </Link>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total de Beneficiários" value={stats.totalBeneficiarios} color="bg-brand-primary-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.275-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.275.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Total de Famílias" value={stats.totalFamilias} color="bg-brand-accent-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
                <StatCard title="Tarefas Concluídas (Mês)" value={stats.tarefasConcluidasMes} color="bg-blue-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Engajamento em Cursos" value={`${stats.mediaEngajamentoCursos}%`} color="bg-brand-secondary-200" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BarChart title="Tarefas por Status" data={stats.tasksByStatus} color="bg-brand-primary-900" />
                    <BarChart title="Inscrições em Cursos por Categoria" data={stats.coursesByCategory} color="bg-brand-accent-500" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-gray-700 mb-2">Atividade Recente</h3>
                     <div className="divide-y">
                        {stats.recentActivity.map(act => <ActivityItem key={act.id} activity={act} />)}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SecretaryDashboardPage;
