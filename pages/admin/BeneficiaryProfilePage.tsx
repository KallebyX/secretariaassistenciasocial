import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock data - substitua pela chamada da API
const beneficiary = { 
  id: 1, 
  name: 'Maria da Silva', 
  cpf: '123.456.789-00', 
  nis: '12345678901', 
  birthDate: '1985-05-20',
  address: 'Rua das Flores, 123, Centro',
  phone: '(55) 99999-8888',
  programs: ['Bolsa Família', 'Auxílio Gás'],
  history: [
    { date: '2025-08-10', event: 'Atendimento inicial e cadastro no CadÚnico.' },
    { date: '2025-08-15', event: 'Inclusão no programa Bolsa Família.' },
  ]
};


const BeneficiaryProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{beneficiary.name}</h1>
          <p className="text-gray-600">CPF: {beneficiary.cpf} | NIS: {beneficiary.nis}</p>
        </div>
        <Link to="/admin/beneficiaries" className="text-prefeitura-verde hover:underline">
          &larr; Voltar para a lista
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Informações Pessoais</h2>
          <p><strong>Data de Nasc.:</strong> {beneficiary.birthDate}</p>
          <p><strong>Endereço:</strong> {beneficiary.address}</p>
          <p><strong>Telefone:</strong> {beneficiary.phone}</p>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Programas e Histórico</h2>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Programas Inscritos:</h3>
            <div className="flex flex-wrap gap-2">
              {beneficiary.programs.map(program => (
                <span key={program} className="bg-prefeitura-amarelo text-gray-800 px-3 py-1 rounded-full text-sm">{program}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Histórico de Atendimentos:</h3>
            <ul className="list-disc list-inside space-y-2">
              {beneficiary.history.map(item => (
                <li key={item.date}><strong>{item.date}:</strong> {item.event}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryProfilePage;
