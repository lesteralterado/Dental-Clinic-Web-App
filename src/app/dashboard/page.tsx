'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, CheckCircle, Plus, ArrowRight, QrCode } from 'lucide-react';
import { Patient, Appointment } from '@/lib/types';
import { format } from 'date-fns';
import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';
import { patientService } from '@/lib/api/patients';
import { appointmentService } from '@/lib/api/appointments';

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use real API services
  const patientSvc = patientService;
  const appointmentSvc = appointmentService;
  
  // Set up appointment reminders
  useAppointmentReminders(appointments);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!patientSvc || !appointmentSvc) {
          throw new Error('API services not available');
        }
        const [patientsData, appointmentsData] = await Promise.all([
          patientSvc.getRecent(),
          appointmentSvc.getToday(),
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load data. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length > 0 ? '+' : '0',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: "Today's Appointments",
      value: appointments.length,
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Pending',
      value: appointments.filter(a => a.status === 'SCHEDULED').length,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Completed',
      value: appointments.filter(a => a.status === 'COMPLETED').length,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </a>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <a
          href="/dashboard/patients/new"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Register Patient</h3>
              <p className="text-sm text-slate-500">Add new patient record</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </a>

        <a
          href="/dashboard/appointments"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <Calendar className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Schedule Appointment</h3>
              <p className="text-sm text-slate-500">Book a new appointment</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </div>
        </a>

        <a
          href="/dashboard/checkin"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <QrCode className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Patient Check-in</h3>
              <p className="text-sm text-slate-500">Scan QR or face to check in</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
        </a>
      </motion.div>

      {/* Recent Patients & Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Patients</h2>
            <a
              href="/dashboard/patients"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              View all
            </a>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No patients yet</div>
            ) : (
              patients.slice(0, 5).map((patient) => (
                <div key={patient.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{patient.name}</p>
                    <p className="text-sm text-slate-500 truncate">{patient.telephone}</p>
                  </div>
                  <a
                    href={`/dashboard/patients/${patient.id}`}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Today's Appointments</h2>
            <a
              href="/dashboard/appointments"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              View all
            </a>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No appointments today</div>
            ) : (
              appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                    {appointment.patient?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {appointment.patient?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appointment.appointmentTime} - {appointment.reason || 'General Visit'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : appointment.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-700'
                        : appointment.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}