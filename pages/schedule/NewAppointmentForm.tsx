import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Beneficiary } from '../../types'; // Assuming you have a Beneficiary type

interface NewAppointmentFormProps {
  onAppointmentCreated: () => void;
}

interface IFormInputs {
  beneficiary_id: number;
  date: string;
  time: string;
  reason: string;
}

const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({ onAppointmentCreated }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<IFormInputs>();
  const { addToast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch beneficiaries to populate the dropdown
    const fetchBeneficiaries = async () => {
      try {
        const response = await api.get('/beneficiaries');
        setBeneficiaries(response.data.data);
      } catch (error) {
        addToast('Falha ao carregar beneficiários.', 'error');
      }
    };
    fetchBeneficiaries();
  }, [addToast]);

  const onSubmit = async (data: IFormInputs) => {
    setLoading(true);
    try {
      await api.post('/appointments', data);
      addToast('Agendamento criado com sucesso!', 'success');
      onAppointmentCreated();
    } catch (error) {
      addToast('Falha ao criar agendamento.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Novo Agendamento</h2>
      
      <div>
        <label htmlFor="beneficiary_id" className="block text-sm font-medium text-gray-700">Beneficiário</label>
        <Controller
          name="beneficiary_id"
          control={control}
          rules={{ required: 'Beneficiário é obrigatório' }}
          render={({ field }) => (
            <select {...field} id="beneficiary_id" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Selecione um beneficiário</option>
              {beneficiaries.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        />
        {errors.beneficiary_id && <p className="text-red-500 text-xs mt-1">{errors.beneficiary_id.message}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
        <input type="date" id="date" {...register('date', { required: 'Data é obrigatória' })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
        <input type="time" id="time" {...register('time', { required: 'Hora é obrigatória' })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo</label>
        <textarea id="reason" {...register('reason', { required: 'Motivo é obrigatório' })} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
        {loading ? 'Salvando...' : 'Salvar Agendamento'}
      </button>
    </form>
  );
};

export default NewAppointmentForm;
