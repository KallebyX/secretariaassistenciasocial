import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { News } from '../types';

const HomePage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setNews(response.data.data);
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
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    return { day, month };
  };

  return (
    <div className="bg-gray-50">
    <Layout>
      <div className="container mx-auto px-4">
        <header className="relative text-center mb-16 text-white">
          <img 
            src="https://www.cacapavadosul.rs.gov.br/uploads/categories/1/downloads/1/642d755f92c67.jpg" 
            alt="Crianças sorrindo" 
            className="w-full h-96 object-cover rounded-b-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center rounded-b-lg">
            <h1 className="text-5xl font-extrabold">Portal da Secretaria de Assistência Social</h1>
            <p className="text-xl mt-4 max-w-2xl">Conectando você aos serviços e programas que transformam vidas em Caçapava do Sul.</p>
          </div>
        </header>

        <section id="acoes" className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Nossas Ações</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-3 text-prefeitura-verde">Programa Criança Feliz</h3>
              <p className="text-gray-600">Acompanhamento de gestantes e crianças para promover o desenvolvimento infantil e fortalecer vínculos.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-3 text-prefeitura-verde">Fortalecimento de Vínculos</h3>
              <p className="text-gray-600">Atividades em grupo para fortalecer os laços familiares e comunitários, prevenindo o isolamento.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-3 text-prefeitura-verde">Cadastro Único</h3>
              <p className="text-gray-600">A porta de entrada para mais de 20 programas sociais do Governo Federal. Mantenha seu cadastro atualizado.</p>
            </div>
          </div>
        </section>

        <section id="noticias" className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Últimas Notícias</h2>
          <div className="space-y-10">
            {loading && <p className="text-center">Carregando notícias...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && news.length === 0 && (
              <p className="text-center text-gray-500">Nenhuma notícia encontrada.</p>
            )}
            {news.map((item) => {
              const { day, month } = formatDate(item.createdAt);
              return (
                <div key={item.id} className="bg-white p-8 rounded-xl shadow-lg flex items-start gap-8 hover:shadow-2xl transition-shadow">
                  <div className="flex-shrink-0 text-center">
                    <p className="text-prefeitura-vermelho font-bold text-3xl">{day}</p>
                    <p className="text-gray-500">{month}</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-prefeitura-vermelho">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                    <p className="text-sm text-gray-500 mt-2">Por: {item.author}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="sobre" className="mb-16 bg-prefeitura-verde text-white p-12 rounded-xl">
          <h2 className="text-4xl font-bold mb-6 text-center">Sobre o Sistema</h2>
          <p className="text-lg max-w-4xl mx-auto text-center leading-relaxed">
            Este sistema foi desenvolvido para modernizar e agilizar o acesso aos serviços da Secretaria de Assistência Social. 
            Através dele, cidadãos e servidores podem interagir de forma mais eficiente, transparente e segura, facilitando o acesso a programas e o acompanhamento de solicitações.
          </p>
        </section>

        <section id="acesso" className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Pronto para Começar?</h2>
            <div className="flex justify-center gap-6">
                <Link to="/login" className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                    Login
                </Link>
                <Link to="/register" className="bg-prefeitura-vermelho hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                    Cadastro
                </Link>
            </div>
        </section>
      </div>
    </Layout>
    </div>
  );
};

export default HomePage;
