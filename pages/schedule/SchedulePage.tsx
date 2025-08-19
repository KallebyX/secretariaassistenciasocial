import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import NewAppointmentForm from './NewAppointmentForm';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Dia Inteiro',
  previous: '<',
  next: '>',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
};

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Assuming server_id is available in the user object for servers
      const params = user?.cargo === 'servidor' ? { server_id: user.id } : {};
      const response = await api.get('/appointments', { params });
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const events = appointments.map(app => ({
    id: app.id,
    title: `${app.reason} - ${app.beneficiary_name}`,
    start: moment(`${app.date}T${app.time}`).toDate(),
    end: moment(`${app.date}T${app.time}`).add(30, 'minutes').toDate(), // Assume 30 min duration
    resource: app,
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  };
  
  const handleAppointmentCreated = () => {
    setIsModalOpen(false);
    fetchAppointments(); // Refresh the list
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Agenda de Atendimentos</h1>
          <button 
            onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
            className="bg-prefeitura-verde hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg"
          >
            Novo Agendamento
          </button>
        </div>

        {loading ? (
          <p>Carregando agenda...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: '70vh' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              onSelectEvent={handleSelectEvent}
              popup
            />
          </div>
        )}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? selectedEvent.reason : 'Novo Agendamento'}>
        {selectedEvent ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedEvent.reason}</h2>
            <p><strong>Beneficiário:</strong> {selectedEvent.beneficiary_name}</p>
            <p><strong>Data:</strong> {moment(selectedEvent.date).format('DD/MM/YYYY')}</p>
            <p><strong>Hora:</strong> {selectedEvent.time}</p>
            <p><strong>Status:</strong> {selectedEvent.status}</p>
          </div>
        ) : (
          <NewAppointmentForm onAppointmentCreated={handleAppointmentCreated} />
        )}
      </Modal>
    </Layout>
  );
};

export default SchedulePage;
