import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { News } from '../../types';

const SingleNewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await api.get(`/news/${id}`);
        setNewsItem(response.data.data);
      } catch (err) {
        setError('Não foi possível carregar a notícia.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsItem();
    }
  }, [id]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {loading && <p className="text-center">Carregando...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {newsItem && (
          <article className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{newsItem.title}</h1>
            <p className="text-gray-500 mb-6">
              Por {newsItem.author} em {new Date(newsItem.createdAt).toLocaleDateString('pt-BR')}
            </p>
            <div className="prose max-w-none">
              <p>{newsItem.content}</p>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
};

export default SingleNewsPage;
