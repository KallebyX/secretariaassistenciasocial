import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { Program } from '../../types';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

const ProgramManagementPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programName, setProgramName] = useState('');
  const { addToast } = useToast();

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs');
      setPrograms(response.data.data);
    } catch (error) {
      addToast('Erro ao carregar a lista de programas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleOpenModal = (program: Program | null = null) => {
    setSelectedProgram(program);
    setProgramName(program ? program.name : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
    setProgramName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim()) {
      addToast('O nome do programa não pode ser vazio.', 'error');
      return;
    }

    const apiCall = selectedProgram
      ? api.put(`/programs/${selectedProgram.id}`, { name: programName })
      : api.post('/programs', { name: programName });

    try {
      await apiCall;
      addToast(
        `Programa ${selectedProgram ? 'atualizado' : 'criado'} com sucesso!`,
        'success'
      );
      handleCloseModal();
      fetchPrograms();
    } catch (error) {
      addToast(
        `Erro ao ${selectedProgram ? 'atualizar' : 'criar'} programa.`,
        'error'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este programa? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/programs/${id}`);
        addToast('Programa excluído com sucesso!', 'success');
        fetchPrograms();
      } catch (error) {
        addToast('Erro ao excluir programa.', 'error');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Programas</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Novo Programa
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Carregando programas...</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Programa</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{program.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(program)}
                      className="text-prefeitura-azul hover:text-blue-700 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={selectedProgram ? 'Editar Programa' : 'Novo Programa'} isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Programa
            </label>
            <input
              id="programName"
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prefeitura-verde focus:border-prefeitura-verde"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg"
            >
              {selectedProgram ? 'Salvar Alterações' : 'Criar Programa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgramManagementPage;
