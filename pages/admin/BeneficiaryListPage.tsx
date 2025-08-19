import React from 'react';
import { Link } from 'react-router-dom';

// Mock data - substitua pela chamada da API
const beneficiaries = [
  { id: 1, name: 'Maria da Silva', cpf: '123.456.789-00', nis: '12345678901', program: 'Bolsa Família' },
  { id: 2, name: 'João Pereira', cpf: '987.654.321-00', nis: '09876543210', program: 'Criança Feliz' },
  { id: 3, name: 'Ana Costa', cpf: '111.222.333-44', nis: '11223344556', program: 'Bolsa Família' },
];

const BeneficiaryListPage: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Beneficiários</h1>
        <Link to="/admin/beneficiaries/new" className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg">
          Novo Beneficiário
        </Link>
      </div>
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome, CPF ou NIS..."
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
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Programa Principal</th>
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((beneficiary) => (
              <tr key={beneficiary.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{beneficiary.name}</td>
                <td className="py-3 px-4">{beneficiary.cpf}</td>
                <td className="py-3 px-4">{beneficiary.nis}</td>
                <td className="py-3 px-4">{beneficiary.program}</td>
                <td className="py-3 px-4">
                  <Link to={`/admin/beneficiaries/${beneficiary.id}`} className="text-prefeitura-verde hover:underline">
                    Ver Perfil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BeneficiaryListPage;
