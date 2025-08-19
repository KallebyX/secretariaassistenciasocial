import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { News } from '../types';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Users, Newspaper, ShieldCheck } from 'lucide-react';

const HomePage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setNews(response.data.data.slice(0, 3)); // Pega apenas as 3 primeiras notícias
      } catch (err) {
        setError('Não foi possível carregar as notícias.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
      },
    },
  };

  return (
    <Layout>
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <motion.section 
          className="bg-gradient-to-br from-brand-primary-700 to-brand-primary-900 text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-6 py-24 text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-heading font-extrabold leading-tight"
              variants={itemVariants}
            >
              Portal de Assistência Social
            </motion.h1>
            <motion.p 
              className="mt-4 text-lg md:text-xl text-brand-primary-100 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Conectando cidadãos de Caçapava do Sul aos serviços e programas que promovem bem-estar e dignidade.
            </motion.p>
            <motion.div 
              className="mt-10 flex justify-center gap-4"
              variants={itemVariants}
            >
              <Link to="/login" className="bg-white text-brand-primary-800 font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Acessar Portal
              </Link>
              <a href="#noticias" className="bg-transparent border-2 border-white/80 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 hover:bg-white/10">
                Ver Notícias
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* Seção de Acesso Rápido */}
        <section id="acesso-rapido" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-heading font-bold text-center text-brand-neutral-800 mb-16">Acesso Rápido</h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={itemVariants} className="bg-brand-neutral-50 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-2 duration-300">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary-100 text-brand-primary-700 mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-brand-neutral-900">Portal do Cidadão</h3>
                <p className="text-brand-neutral-600 mb-6">Consulte seus benefícios, agendamentos e informações de programas sociais.</p>
                <Link to="/beneficiary-portal" className="font-bold text-brand-primary-700 hover:text-brand-primary-800 flex items-center group">
                  Acessar agora <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-brand-neutral-50 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-2 duration-300">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-secondary-200 text-brand-secondary-800 mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-brand-neutral-900">Painel do Servidor</h3>
                <p className="text-brand-neutral-600 mb-6">Gerencie atendimentos, beneficiários e visualize relatórios completos.</p>
                <Link to="/login" className="font-bold text-brand-secondary-700 hover:text-brand-secondary-800 flex items-center group">
                  Fazer Login <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-brand-neutral-50 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-2 duration-300">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-700 mb-6">
                  <Newspaper size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-brand-neutral-900">Programas Sociais</h3>
                <p className="text-brand-neutral-600 mb-6">Conheça os programas disponíveis, seus objetivos e como participar.</p>
                <Link to="/programs" className="font-bold text-red-700 hover:text-red-800 flex items-center group">
                  Saber mais <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Seção de Notícias */}
        <section id="noticias" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-heading font-bold text-center text-brand-neutral-800 mb-16">Últimas Notícias</h2>
            {loading && <p className="text-center text-brand-neutral-500">Carregando notícias...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && news.length === 0 && (
              <p className="text-center text-brand-neutral-500">Nenhuma notícia encontrada no momento.</p>
            )}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {news.map((item) => (
                <motion.article 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  variants={itemVariants}
                >
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-sm text-brand-neutral-500 mb-2">{formatDate(item.createdAt)}</p>
                    <h3 className="text-xl font-heading font-bold mb-3 text-brand-neutral-900 flex-grow">{item.title}</h3>
                    <p className="text-brand-neutral-600 mb-6">{item.content.substring(0, 120)}...</p>
                    <a href="#" className="font-bold text-brand-primary-700 hover:text-brand-primary-800 flex items-center mt-auto group">
                      Ler matéria completa <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
