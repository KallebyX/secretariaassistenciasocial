import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Beneficiary } from '../../types';
import { useToast } from '../../context/ToastContext';

const BeneficiaryListPage: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const fetchBeneficiaries = useCallback(async (search: string) => {
    try {
      setLoading(true);
      const response = await api.get('/beneficiaries', {
        params: { search },
      });
      setBeneficiaries(response.data.data);
    } catch (error) {
      addToast('Erro ao buscar beneficiários.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBeneficiaries(searchTerm);
    }, 500); // Atraso de 500ms para debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchBeneficiaries]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Beneficiários</h1>
        {/* O botão para novo beneficiário pode ser implementado no futuro */}
        {/* <Link to="/admin/beneficiaries/new" className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg">
          Novo Beneficiário
        </Link> */}
      </div>
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prefeitura-amarelo"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Nome</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">CPF</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">NIS</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">Carregando...</td>
              </tr>
            ) : beneficiaries.length > 0 ? (
              beneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{beneficiary.name}</td>
                  <td className="py-3 px-4">{beneficiary.cpf}</td>
                  <td className="py-3 px-4">{beneficiary.nis || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <Link to={`/admin/beneficiaries/${beneficiary.id}`} className="text-prefeitura-verde hover:underline">
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">Nenhum beneficiário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BeneficiaryListPage;
