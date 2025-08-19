import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Program {
  id: number;
  name: string;
  description: string;
}

const ProgramManagementPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };
    if (editingProgram) {
      await api.put(`/programs/${editingProgram.id}`, payload);
    } else {
      await api.post('/programs', payload);
    }
    fetchPrograms();
    resetForm();
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setName(program.name);
    setDescription(program.description);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      await api.delete(`/programs/${id}`);
      fetchPrograms();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingProgram(null);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">{editingProgram ? 'Editar Programa' : 'Novo Programa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Nome do Programa</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={4}
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-prefeitura-verde text-white font-bold py-2 px-4 rounded-lg">
              {editingProgram ? 'Salvar Alterações' : 'Criar Programa'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Programas Sociais Cadastrados</h2>
        <div className="space-y-4">
          {programs.map(program => (
            <div key={program.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold">{program.name}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(program)} className="text-blue-500 hover:underline">Editar</button>
                <button onClick={() => handleDelete(program.id)} className="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramManagementPage;
