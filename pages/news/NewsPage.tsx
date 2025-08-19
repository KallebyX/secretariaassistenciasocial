import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { News } from '../../types';

const NewsPage: React.FC = () => {
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

  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Todas as Notícias</h1>
        {loading && <p className="text-center">Carregando...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/news/${item.id}`)}
            >
              <h2 className="text-2xl font-bold text-prefeitura-verde mb-2">{item.title}</h2>
              <p className="text-gray-600 truncate">{item.content}</p>
              <p className="text-sm text-gray-500 mt-4">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NewsPage;
