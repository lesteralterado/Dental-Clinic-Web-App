'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, MoreVertical, Phone, Mail, Calendar, QrCode, User } from 'lucide-react';
import { Patient } from '@/lib/types';
import Link from 'next/link';

// Use mock data for demo
const USE_MOCK_DATA = true;
import { mockPatientService } from '@/lib/mock';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Choose service based on demo mode
  const patientSvc = USE_MOCK_DATA ? mockPatientService : null;

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        if (!patientSvc) throw new Error('Service not available');
        const response = await patientSvc.getAll({ page, limit: 20, search });
        setPatients(response.patients);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500">Manage patient records and information</p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </Link>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </motion.div>

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No patients found</p>
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Patient
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">QR Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{patient.name}</p>
                          <p className="text-sm text-slate-500">{patient.occupation || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {patient.telephone}
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800">{patient.age} years</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800">{patient.gender || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {patient.qrCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-blue-600"
                          title="View Details"
                        >
                          <User className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/dashboard/patients/${patient.id}/qr`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-emerald-600"
                          title="View QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/dashboard/appointments/new?patientId=${patient.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-indigo-600"
                          title="Schedule Appointment"
                        >
                          <Calendar className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}