'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, Clock, User, CheckCircle, XCircle, 
  Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Appointment, Patient } from '@/lib/types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import Link from 'next/link';

// Use mock data for demo
const USE_MOCK_DATA = true;
import { mockAppointmentService, mockPatientService } from '@/lib/mock';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  // Choose service based on demo mode
  const appointmentSvc = USE_MOCK_DATA ? mockAppointmentService : null;
  const patientSvc = USE_MOCK_DATA ? mockPatientService : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!appointmentSvc || !patientSvc) throw new Error('Service not available');
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const [appointmentsData, patientsData] = await Promise.all([
          appointmentSvc.getAll({ date: dateStr }),
          patientSvc.getAll({ limit: 100 }),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData.patients);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      if (!appointmentSvc) throw new Error('Service not available');
      const updated = await appointmentSvc.checkIn(appointmentId);
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? updated : apt)
      );
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500">Manage patient appointments</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </Link>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`p-3 rounded-xl text-center transition-all ${
                isSameDay(day, selectedDate)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'hover:bg-slate-100'
              }`}
            >
              <p className="text-xs opacity-70">{format(day, 'EEE')}</p>
              <p className="font-semibold">{format(day, 'd')}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Appointments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-sm text-slate-500">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No appointments for this day</p>
            <Link
              href="/dashboard/appointments/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Schedule Appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col items-center min-w-[60px]">
                  <Clock className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-800">
                    {appointment.appointmentTime}
                  </span>
                  <span className="text-xs text-slate-500">
                    {appointment.duration}min
                  </span>
                </div>

                <div className="w-px h-12 bg-slate-200" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800">
                      {appointment.patient?.name || 'Unknown Patient'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {appointment.reason || 'General Visit'}
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-slate-400 mt-1">{appointment.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {appointment.status === 'SCHEDULED' && !appointment.isCheckedIn && (
                    <button
                      onClick={() => handleCheckIn(appointment.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Check In
                    </button>
                  )}
                  {appointment.isCheckedIn && (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Checked In
                    </span>
                  )}
                  <Link
                    href={`/dashboard/patients/${appointment.patientId}`}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View Patient"
                  >
                    <User className="w-5 h-5 text-slate-400" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}