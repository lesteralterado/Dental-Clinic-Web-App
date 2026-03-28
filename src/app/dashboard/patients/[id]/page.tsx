'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, MapPin, Phone, Mail, Calendar, Briefcase, 
  Heart, MessageSquare, QrCode, Send, Edit, Trash2, Loader2, Check
} from 'lucide-react';
import { Patient } from '@/lib/types';
import QRCodeComponent from '@/components/QRCode';
import PaymentHistory from '@/components/patient/payment-history';

// Use API services for real backend data
import { patientService } from '@/lib/api/patients';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Use real API service
  const patientSvc = patientService;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (!patientSvc) throw new Error('Service not available');
        const data = await patientSvc.getById(params.id as string);
        setPatient(data);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        router.push('/dashboard/patients');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPatient();
    }
  }, [params.id, router]);

  const sendQREmail = async () => {
    if (!patient?.email) return;
    
    setSendingEmail(true);
    try {
      if (!patientSvc) throw new Error('Service not available');
      await patientSvc.sendQREmail(patient.id, patient.email);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Failed to send QR email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const qrData = JSON.stringify({ type: 'patient', id: patient.id, qrCode: patient.qrCode });

  return (
    <div className="max-w-6xl mx-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
              <p className="text-slate-500">QR: <span className="font-mono">{patient.qrCode}</span></p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`/dashboard/patients/${patient.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit
            </a>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={MapPin} label="Address" value={patient.address} />
              <InfoItem icon={Phone} label="Phone" value={patient.telephone} />
              <InfoItem icon={Mail} label="Email" value={patient.email || 'N/A'} />
              <InfoItem icon={Calendar} label="Age" value={`${patient.age} years`} />
              <InfoItem icon={User} label="Gender" value={patient.gender || 'N/A'} />
              <InfoItem icon={Briefcase} label="Occupation" value={patient.occupation || 'N/A'} />
              <InfoItem icon={Heart} label="Marital Status" value={patient.status || 'N/A'} />
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Medical Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Initial Complaint</p>
                <p className="text-slate-800">{patient.complaint || 'No complaint recorded'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Medical Notes</p>
                <p className="text-slate-800">{patient.medicalNotes || 'No medical notes'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Allergies</p>
                <p className="text-slate-800">{patient.allergies || 'No allergies recorded'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Emergency Contact
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={User} label="Contact Name" value={patient.emergencyContact || 'N/A'} />
              <InfoItem icon={Phone} label="Contact Phone" value={patient.emergencyPhone || 'N/A'} />
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <PaymentHistory patientId={patient.id} patientName={patient.name} />
          </div>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" />
              QR Code
            </h2>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
              <QRCodeComponent value={qrData} size={200} />
            </div>
            
            <p className="text-sm text-slate-500 text-center mb-4">
              Scan this code for quick patient check-in
            </p>

            {patient.email && (
              <button
                onClick={sendQREmail}
                disabled={sendingEmail}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all ${
                  sendingEmail
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : emailSent
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/40'
                }`}
              >
                {sendingEmail ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : emailSent ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {sendingEmail ? 'Sending...' : emailSent ? 'Sent!' : 'Send QR via Email'}
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <a
                href={`/dashboard/appointments/new?patientId=${patient.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="font-medium text-slate-700">Schedule Appointment</span>
              </a>
              
              <a
                href={`/dashboard/checkin?patientId=${patient.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <QrCode className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-medium text-slate-700">Check-in Patient</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-100">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}