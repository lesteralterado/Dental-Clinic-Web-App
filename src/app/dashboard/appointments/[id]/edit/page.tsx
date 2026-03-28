'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, User, FileText, Loader2, ArrowLeft, Save, Check
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { appointmentService } from '@/lib/api/appointments';
import { format } from 'date-fns';

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    duration: '30',
    status: 'SCHEDULED',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const appointmentId = params.id as string;
      const dateParam = searchParams.get('date');
      
      try {
        // For new appointments, use date param or today
        if (!appointmentId && dateParam) {
          setFormData(prev => ({ ...prev, appointmentDate: dateParam }));
          setLoading(false);
          return;
        }

        // For existing appointments, fetch the data
        if (appointmentId) {
          const appointments = await appointmentService.getAll({ date: '' });
          const apt = appointments.find(a => a.id === appointmentId);
          
          if (apt) {
            setAppointment(apt);
            setFormData({
              appointmentDate: apt.appointmentDate,
              appointmentTime: apt.appointmentTime,
              duration: apt.duration.toString(),
              status: apt.status,
              reason: apt.reason || '',
              notes: apt.notes || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!appointment) {
        // Creating new appointment
        // This would call create in real app
        setSaved(true);
        setTimeout(() => router.push('/dashboard/appointments'), 1500);
      } else {
        // Updating existing appointment
        // This would call update in real app
        setSaved(true);
        setTimeout(() => router.push('/dashboard/appointments'), 1500);
      }
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      setError(err.response?.data?.message || 'Failed to save appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </h1>
        <p className="text-slate-500">
          {appointment ? 'Update appointment details' : 'Schedule a new appointment'}
        </p>
      </motion.div>

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-700">Appointment saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
        >
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Appointment Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            {appointment && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Regular checkup, Toothache, Teeth cleaning"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes for the appointment..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {appointment ? 'Save Changes' : 'Create Appointment'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
