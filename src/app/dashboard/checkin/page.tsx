'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, ScanFace, Camera, Search, User, Calendar, 
  CheckCircle, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import { Patient, Appointment } from '@/lib/types';
import jsQR from 'jsqr';
import { patientService } from '@/lib/api/patients';
import { appointmentService } from '@/lib/api/appointments';
import { useNotifications } from '@/hooks/useNotifications';
import BoxScanner from '@/components/box-scanner';

type TabType = 'qr' | 'face' | 'search';

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const { triggerNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'qr' | 'face' | 'search'>('qr');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  // Use real API services
  const patientSvc = patientService;
  const appointmentSvc = appointmentService;

  // QR Scanner refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);

  // Face recognition refs
  const faceVideoRef = useRef<HTMLVideoElement>(null);
  const [faceScanning, setFaceScanning] = useState(false);
  const [showFullscreenScanner, setShowFullscreenScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'face' | 'qr'>('face');

  useEffect(() => {
    if (patientIdParam) {
      loadPatient(patientIdParam);
    }
  }, [patientIdParam]);

  const loadPatient = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      if (!patientSvc || !appointmentSvc) throw new Error('Service not available');
      
      let patientData: Patient | null = null;
      
      // Try to find patient by ID first
      try {
        patientData = await patientSvc.getById(id);
        console.log('[Check-in] Found patient by ID:', id);
      } catch (e) {
        // If not found by ID, try to find by qrCode
        console.log('[Check-in] Patient not found by ID, trying qrCode lookup:', id);
        const searchResults = await patientSvc.search(id);
        patientData = searchResults[0] || null;
        
        if (patientData) {
          console.log('[Check-in] Found patient by search:', patientData.id);
        }
      }
      
      if (!patientData) {
        throw new Error('Patient not found. Please check the QR code or try searching manually.');
      }
      
      setPatient(patientData);
      
      // Get today's appointments for this patient
      const today = new Date().toISOString().split('T')[0];
      const allAppointments = await appointmentSvc.getAll({ date: today });
      const patientAppointments = allAppointments.filter(a => a.patientId === patientData!.id);
      setAppointments(patientAppointments);
    } catch (err: any) {
      console.error('Failed to load patient:', err);
      setError(err.message || 'Failed to load patient information');
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner (Legacy - kept for reference)
  // Now using BoxScanner for QR scanning

  // Face Scanner
  const startFaceScan = async () => {
    setScannerType('face');
    setShowFullscreenScanner(true);
  };

  const startQRScan = async () => {
    setScannerType('qr');
    setShowFullscreenScanner(true);
  };

  const handleScannerCapture = async (imageData: string) => {
    if (scannerType === 'qr') {
      // For QR, we use onQRScan callback from the scanner
      // The scanner handles the QR decoding internally
    } else {
      // Handle face recognition
      setLoading(true);
      setError('');
      try {
        const faceTemplate = JSON.stringify({
          image: imageData,
          timestamp: Date.now()
        });

        if (!patientSvc || !appointmentSvc) throw new Error('Service not available');
        const result = await patientSvc.identifyByFace(faceTemplate);
        setPatient(result.patient);
        
        const today = new Date().toISOString().split('T')[0];
        const allAppointments = await appointmentSvc.getAll({ date: today });
        const patientAppointments = allAppointments.filter(a => a.patientId === result.patient.id);
        setAppointments(patientAppointments);
        
        setShowFullscreenScanner(false);
      } catch (err: any) {
        console.error('Face identification failed:', err);
        setError(err.response?.data?.message || 'No matching face found. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQRScan = (data: string) => {
    setShowFullscreenScanner(false);
    loadPatient(data);
  };

  const captureAndIdentify = async () => {
    if (!faceVideoRef.current) return;
    
    setLoading(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = faceVideoRef.current.videoWidth;
      canvas.height = faceVideoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(faceVideoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Create face template (simplified - in production use face-api.js)
        const faceTemplate = JSON.stringify({
          image: imageData,
          timestamp: Date.now()
        });

        if (!patientSvc || !appointmentSvc) throw new Error('Service not available');
        const result = await patientSvc.identifyByFace(faceTemplate);
        setPatient(result.patient);
        
        // Get appointments
        const today = new Date().toISOString().split('T')[0];
        const allAppointments = await appointmentSvc.getAll({ date: today });
        const patientAppointments = allAppointments.filter(a => a.patientId === result.patient.id);
        setAppointments(patientAppointments);
      }
    } catch (err: any) {
      console.error('Face identification failed:', err);
      setError(err.response?.data?.message || 'No matching face found. Please try again.');
    } finally {
      setFaceScanning(false);
      stopFaceScan();
      setLoading(false);
    }
  };

  const stopFaceScan = () => {
    setFaceScanning(false);
    if (faceVideoRef.current?.srcObject) {
      const tracks = (faceVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      if (!patientSvc) throw new Error('Service not available');
      const results = await patientSvc.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check-in
  const handleCheckIn = async (appointmentId: string) => {
    setLoading(true);
    try {
      if (!appointmentSvc) throw new Error('Service not available');
      await appointmentSvc.checkIn(appointmentId);
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, isCheckedIn: true } : apt)
      );
      
      // Trigger notification for check-in
      if (patient) {
        triggerNotification('check_in', patient.name);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Check-in failed:', err);
      setError('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPatient(null);
    setAppointments([]);
    setError('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-800">Patient Check-in</h1>
        <p className="text-slate-500">Scan QR code or use face recognition to check in a patient</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-600 text-sm">Patient checked in successfully!</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {patient ? (
          <motion.div
            key="patient-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Patient Found Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                    <p className="text-slate-500">{patient.telephone} • {patient.age} years old</p>
                    <p className="text-sm text-slate-400">QR: {patient.qrCode}</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Scan Another
                </button>
              </div>

              {/* Today's Appointments */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-800 mb-4">Today's Appointments</h3>
                {appointments.length === 0 ? (
                  <p className="text-slate-500">No appointments scheduled for today</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(apt => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{apt.appointmentTime}</p>
                            <p className="text-sm text-slate-500">{apt.reason || 'General Visit'}</p>
                          </div>
                        </div>
                        {apt.isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Checked In
                          </span>
                        ) : apt.status === 'SCHEDULED' ? (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4" />
                                Check In
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                            {apt.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'qr'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  QR Code
                </button>
                <button
                  onClick={() => setActiveTab('face')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'face'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ScanFace className="w-5 h-5" />
                  Face ID
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'search'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>

            {/* QR Scanner */}
            {activeTab === 'qr' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Scan QR Code</h3>
                
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-6">Point the camera at the patient's QR code</p>
                  <button
                    onClick={startQRScan}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera
                  </button>
                </div>
              </div>
            )}

            {/* Face Scanner */}
            {activeTab === 'face' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Face Recognition</h3>
                
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ScanFace className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-6">Position the patient's face in the frame</p>
                  <button
                    onClick={startFaceScan}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            {activeTab === 'search' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Search Patient</h3>
                
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or phone number..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 mb-3">{searchResults.length} result(s) found</p>
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => {
                          setPatient(result);
                          loadPatient(result.id);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{result.name}</p>
                          <p className="text-sm text-slate-500">{result.telephone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Box Scanner Modal */}
      <BoxScanner
        isOpen={showFullscreenScanner}
        onClose={() => setShowFullscreenScanner(false)}
        onCapture={handleScannerCapture}
        onQRScan={handleQRScan}
        isProcessing={loading}
        type={scannerType}
      />
    </div>
  );
}