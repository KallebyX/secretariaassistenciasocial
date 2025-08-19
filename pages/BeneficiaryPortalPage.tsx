import React, { useState, useEffect } from 'react';
import type { User, Course, ForumPost, Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetchProfile, apiFetchCourses, apiEnrollCourse, apiFetchForumPosts, apiCreateForumPost, apiFetchJobs, apiApplyForJob } from '../services/api';

type Tab = 'profile' | 'courses' | 'forum' | 'jobs';

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-brand-primary-900 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const ProfileView: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<User | null>(user);

    useEffect(() => {
        if(user?.token && !profile?.pontos) { // Re-fetch if profile seems incomplete
            apiFetchProfile(user.token).then(setProfile);
        }
    }, [user, profile]);

    if (!profile) return <div className="text-center p-10">Carregando perfil...</div>;

    const achievements = [
        { level: 1, name: 'Medalha de Boas-vindas', icon: '👋', description: 'Juntou-se à comunidade.'},
        { level: 2, name: 'Medalha de Iniciante', icon: '🌟', description: 'Alcançou o nível 2.' },
        { level: 5, name: 'Medalha de Aprendiz', icon: '🎓', description: 'Alcançou o nível 5.' },
        { level: 10, name: 'Medalha de Experiente', icon: '🏆', description: 'Alcançou o nível 10.' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg text-center animate-slide-in">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.nome}`} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-brand-primary-200"/>
                <h3 className="text-2xl font-bold text-gray-800">{profile.nome}</h3>
                <div className="mt-6 space-y-4">
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-lg font-bold text-brand-primary-900">Nível {profile.nivel}</span>
                            <span className="text-sm text-gray-500">{profile.pontos} / {profile.pontosProximoNivel} XP</span>
                        </div>
                        <ProgressBar value={profile.pontos} max={profile.pontosProximoNivel} />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg animate-slide-in" style={{animationDelay: '100ms'}}>
                 <h4 className="text-xl font-bold text-gray-700 mb-4">Suas Conquistas</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {achievements.map(ach => (
                        <div key={ach.level} className={`p-4 rounded-lg text-center border-2 transition-all ${profile.nivel >= ach.level ? 'border-brand-secondary-400 bg-yellow-50' : 'bg-gray-100 border-gray-200 opacity-60'}`}>
                            <span className="text-4xl">{ach.icon}</span>
                            <p className="font-semibold mt-2">{ach.name}</p>
                            <p className="text-xs text-gray-500">{ach.description}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
}

const CoursesView: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [enrolled, setEnrolled] = useState<number[]>(user?.enrolledCourses || []);

    useEffect(() => {
        apiFetchCourses().then(setCourses);
    }, []);

    const handleEnroll = async (courseId: number) => {
        if(user?.token) {
            try {
                const response = await apiEnrollCourse(user.token, courseId);
                addToast(response.message, 'success');
                setEnrolled(prev => [...prev, courseId]);
            } catch {
                 addToast('Falha na inscrição.', 'error');
            }
        }
    };
    
    const enrolledCourses = courses.filter(c => enrolled.includes(c.id));
    const availableCourses = courses.filter(c => !enrolled.includes(c.id));

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Meus Cursos</h3>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrolledCourses.map(course => (
                           <div key={course.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center border-l-4 border-brand-accent-500">
                                <div>
                                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">{course.categoria}</span>
                                    <h4 className="text-lg font-bold mt-2">{course.titulo}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{course.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 bg-gray-100 p-4 rounded-lg">Você ainda não se inscreveu em nenhum curso.</p>}
            </div>
             <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Cursos Disponíveis</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCourses.map(course => (
                       <div key={course.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-4 sm:mb-0">
                                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{course.categoria}</span>
                                <h4 className="text-lg font-bold mt-2">{course.titulo}</h4>
                                <p className="text-sm text-gray-600 mt-1">{course.descricao}</p>
                            </div>
                            <button onClick={() => handleEnroll(course.id)} className="bg-brand-accent-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent-600 transition-colors self-start sm:self-center flex-shrink-0 sm:ml-4">
                                Inscrever-se
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ForumView: React.FC = () => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { user } = useAuth();
    const { addToast } = useToast();

    useEffect(() => { apiFetchForumPosts().then(setPosts); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.token && title && content) {
            const newPost = await apiCreateForumPost(user.token, title, content);
            setPosts([newPost, ...posts]);
            setTitle('');
            setContent('');
            addToast('Postagem criada com sucesso!', 'success');
        }
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-3">
                <h4 className="text-lg font-bold">Criar nova postagem no fórum</h4>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da sua dúvida ou discussão" required className="w-full border p-2 rounded-md focus:ring-brand-primary-500 focus:border-brand-primary-500" />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Descreva sua mensagem aqui..." required className="w-full border p-2 rounded-md h-24 focus:ring-brand-primary-500 focus:border-brand-primary-500"></textarea>
                <button type="submit" className="bg-brand-primary-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary-800 transition-colors">
                    Publicar Postagem
                </button>
            </form>
            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                        <h5 className="font-bold text-lg text-brand-primary-900">{post.titulo}</h5>
                        <p className="text-xs text-gray-500 mb-2">Por: {post.autor_nome} em {post.data}</p>
                        <p className="my-2 text-gray-700">{post.conteudo}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 border-t pt-2">
                             <span className="flex items-center space-x-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> <span>{post.curtidas}</span></span>
                            <span className="flex items-center space-x-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> <span>{post.respostas}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const JobsView: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [applied, setApplied] = useState<number[]>(user?.appliedJobs || []);

    useEffect(() => { apiFetchJobs().then(setJobs); }, []);

    const handleApply = async (jobId: number) => {
        if(user?.token) {
           try {
               const res = await apiApplyForJob(user.token, jobId);
               addToast(res.message, 'success');
               setApplied(prev => [...prev, jobId]);
           } catch {
                addToast('Falha ao enviar candidatura.', 'error');
           }
        }
    };

    return (
        <div className="space-y-4">
            {jobs.map(job => (
                <div key={job.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-bold text-gray-800">{job.titulo}</h4>
                                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{job.tipo}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-600">{job.empresa} - {job.localidade}</p>
                            <p className="text-sm text-gray-700 mt-2">{job.descricao}</p>
                        </div>
                         <button onClick={() => handleApply(job.id)} disabled={applied.includes(job.id)} className="mt-4 sm:mt-0 bg-brand-primary-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary-800 transition-colors flex-shrink-0 sm:ml-4 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {applied.includes(job.id) ? 'Candidatura Enviada' : 'Candidatar-se'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BeneficiaryPortalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    
    const tabs = [
        { id: 'profile', label: 'Meu Perfil', component: <ProfileView />, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> },
        { id: 'courses', label: 'Cursos', component: <CoursesView />, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61V16.5a1 1 0 001.521.858l4-2.5a1 1 0 000-1.716V9.61l6.394-2.69a1 1 0 000-1.84l-7-3zM14 8.39l-3 1.265V6.39l3-1.265v3.265z" /></svg> },
        { id: 'forum', label: 'Fórum', component: <ForumView />, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg> },
        { id: 'jobs', label: 'Vagas', component: <JobsView />, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm8-1a1 1 0 00-1-1H9a1 1 0 00-1 1v1h6V5z" clipRule="evenodd" /></svg> },
    ];
    
    return (
        <div className="animate-slide-in">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800">Portal do Beneficiário</h2>
            </div>
           
            <div className="mb-6 bg-white p-2 rounded-lg shadow-sm flex space-x-1 sm:space-x-2 flex-wrap justify-center">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex items-center justify-center px-3 py-2 font-semibold rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto my-1 sm:my-0 ${activeTab === tab.id ? 'bg-brand-primary-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
            
            <div>
                {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
        </div>
    );
};

export default BeneficiaryPortalPage;
