import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Beneficiary, Program, Appointment } from '../../types';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { motion } from 'framer-motion';
import { User, Home, Phone, Calendar, Plus, Trash2, Briefcase, Clock, CheckCircle, XCircle, Activity, ArrowLeft } from 'lucide-react';

const InfoCard: React.FC<{ icon: React.ReactNode, label: string, value: string | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border transition-all hover:bg-gray-100 hover:shadow-sm">
        <div className="text-prefeitura-azul pt-1">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <p className="text-lg text-gray-800">{value || 'Não informado'}</p>
        </div>
    </div>
);

const TimelineItem: React.FC<{ appointment: Appointment, isLast: boolean }> = ({ appointment, isLast }) => {
    const getStatusIcon = () => {
        switch (appointment.status) {
            case 'Realizado': return <CheckCircle className="text-green-500" size={20} />;
            case 'Em Andamento': return <Activity className="text-blue-500" size={20} />;
            case 'Pendente': return <Clock className="text-yellow-500" size={20} />;
            default: return <Clock className="text-gray-500" size={20} />;
        }
    };

    return (
        <div className="flex gap-x-3">
            <div className={`relative ${isLast ? '' : 'after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200'}`}>
                <div className="relative z-10 w-7 h-7 flex justify-center items-center">
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex justify-center items-center">
                       {getStatusIcon()}
                    </div>
                </div>
            </div>
            <div className="grow pt-0.5 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-gray-800">{appointment.title}</p>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{new Date(appointment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
};


const BeneficiaryProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const { addToast } = useToast();

  const fetchBeneficiaryData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [beneficiaryRes, enrolledProgramsRes, allProgramsRes, appointmentsRes] = await Promise.all([
        api.get(`/beneficiaries/${id}`),
        api.get(`/beneficiaries/${id}/programs`),
        api.get('/programs'),
        api.get(`/beneficiaries/${id}/appointments`)
      ]);
      setBeneficiary(beneficiaryRes.data.data);
      setEnrolledPrograms(enrolledProgramsRes.data.data);
      setAllPrograms(allProgramsRes.data.data);
      setAppointments(appointmentsRes.data.data);
    } catch (error) {
      addToast('Não foi possível carregar os dados do beneficiário.', 'error' );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchBeneficiaryData();
  }, [fetchBeneficiaryData]);

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) {
      addToast('Por favor, selecione um programa.', 'info');
      return;
    }
    try {
      await api.post(`/beneficiaries/${id}/programs`, { program_id: selectedProgramId });
      addToast('Beneficiário inscrito no programa.', 'success' );
      fetchBeneficiaryData(); // Re-fetch data to update the list
      setIsModalOpen(false);
      setSelectedProgramId('');
    } catch (error) {
      addToast('Não foi possível inscrever o beneficiário no programa.', 'error' );
    }
  };

  const handleRemoveProgram = async (programId: number) => {
    if (window.confirm('Tem certeza que deseja remover este beneficiário do programa?')) {
      try {
        await api.delete(`/beneficiaries/${id}/programs/${programId}`);
        addToast('Beneficiário removido do programa.', 'success' );
        fetchBeneficiaryData(); // Re-fetch data
      } catch (error) {
        addToast('Não foi possível remover o beneficiário do programa.', 'error' );
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-prefeitura-azul"></div>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-500">Beneficiário não encontrado</h2>
        <Link to="/admin/beneficiaries" className="text-prefeitura-azul hover:underline mt-4 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const availablePrograms = allPrograms.filter(p => !enrolledPrograms.some(ep => ep.id === p.id));

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 min-h-screen p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <User size={32} className="text-prefeitura-azul"/>
              {beneficiary.name}
            </h1>
            <p className="text-gray-500 mt-1">CPF: {beneficiary.cpf} | NIS: {beneficiary.nis || 'Não informado'}</p>
          </div>
          <Link to="/admin/beneficiaries" className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm border transition-colors flex items-center gap-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna de Informações e Programas */}
          <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-700 border-b pb-3 mb-4">Informações Pessoais</h2>
                <div className="space-y-4">
                    <InfoCard icon={<Calendar size={20} />} label="Data de Nascimento" value={beneficiary.birthDate ? new Date(beneficiary.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : undefined} />
                    <InfoCard icon={<Home size={20} />} label="Endereço" value={beneficiary.address} />
                    <InfoCard icon={<Phone size={20} />} label="Telefone" value={beneficiary.phone} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                      <h2 className="text-2xl font-bold text-gray-700">Programas</h2>
                      <button onClick={() => setIsModalOpen(true)} className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center gap-1 transition-opacity">
                        <Plus size={16} /> Adicionar
                      </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {enrolledPrograms.length > 0 ? (
                      enrolledPrograms.map(program => (
                          <motion.div 
                              key={program.id} 
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border"
                          >
                              <div className="flex items-center gap-3">
                                  <Briefcase size={18} className="text-prefeitura-azul" />
                                  <span className="font-medium text-gray-800">{program.name}</span>
                              </div>
                              <button onClick={() => handleRemoveProgram(program.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          </motion.div>
                      ))
                      ) : (
                      <p className="text-gray-500 italic text-center py-4">Nenhum programa inscrito.</p>
                      )}
                  </div>
              </div>
          </div>

          {/* Coluna de Histórico */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3">Histórico de Atendimentos</h2>
              <div className="pr-2 max-h-[600px] overflow-y-auto">
                  {appointments.length > 0 ? (
                      appointments
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((appointment, index) => (
                              <TimelineItem 
                                  key={appointment.id} 
                                  appointment={appointment} 
                                  isLast={index === appointments.length - 1} 
                              />
                          ))
                  ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-lg border mt-4">
                          <p className="text-gray-500">Nenhum atendimento registrado para este beneficiário.</p>
                      </div>
                  )}
              </div>
          </div>
        </div>

        <Modal title="Adicionar Beneficiário a um Programa" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddProgram}>
            <div className="mt-4">
              <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                Selecione um Programa
              </label>
              <select
                id="program"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-prefeitura-azul focus:border-prefeitura-azul sm:text-sm rounded-md"
              >
                <option value="" disabled>Selecione...</option>
                {availablePrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                Cancelar
              </button>
              <button type="submit" className="bg-prefeitura-verde text-white font-bold py-2 px-4 rounded-lg hover:opacity-90">
                Adicionar Programa
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </motion.div>
  );
};

export default BeneficiaryProfilePage;
