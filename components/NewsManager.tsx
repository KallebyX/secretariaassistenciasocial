import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const NewsManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      addToast('Título e conteúdo são obrigatórios.', 'error');
      return;
    }
    try {
      await api.post('/news', { title, content, author: 'Secretaria de Assistência Social' });
      addToast('Notícia publicada com sucesso!', 'success');
      setTitle('');
      setContent('');
    } catch (error) {
      addToast('Falha ao publicar notícia.', 'error');
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <h3 className="font-bold text-lg text-gray-700 mb-4">Gerenciar Notícias</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="news-title" className="block text-sm font-medium text-gray-600">Título</label>
          <input
            id="news-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-prefeitura-verde focus:border-prefeitura-verde"
          />
        </div>
        <div>
          <label htmlFor="news-content" className="block text-sm font-medium text-gray-600">Conteúdo</label>
          <textarea
            id="news-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-prefeitura-verde focus:border-prefeitura-verde"
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-prefeitura-vermelho hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg"
          >
            Publicar Notícia
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsManager;
