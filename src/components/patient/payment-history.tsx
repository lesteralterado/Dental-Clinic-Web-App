'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, CreditCard, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, DollarSign, History
} from 'lucide-react';
import { Payment, PaymentStatus } from '@/lib/types';
import { mockPaymentService } from '@/lib/mock';

interface PaymentHistoryProps {
  patientId: string;
  patientName: string;
}

const statusConfig: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid' },
  PARTIAL: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partial' },
  PENDING: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

export default function PaymentHistory({ patientId, patientName }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0, currentBalance: 0 });

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await mockPaymentService.getByPatientId(patientId);
        setPayments(response.payments);
        setSummary({
          totalDebit: response.totalDebit,
          totalCredit: response.totalCredit,
          currentBalance: response.currentBalance,
        });
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [patientId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Appointment History with Dr. Debra
        </h3>
        {payments.length > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {payments.length} visits
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No appointment history</p>
          <p className="text-sm text-slate-500">This patient has not visited Dr. Debra yet</p>
        </div>
      ) : (
        <>
          {/* Balance Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Total Debit</span>
              </div>
              <p className="text-xl font-bold text-red-700">{formatCurrency(summary.totalDebit)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">Total Credit</span>
              </div>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(summary.totalCredit)}</p>
            </div>
            <div className={`rounded-xl p-4 border ${
              summary.currentBalance > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className={`w-4 h-4 ${summary.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                <span className={`text-sm ${summary.currentBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Balance</span>
              </div>
              <p className={`text-xl font-bold ${summary.currentBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {formatCurrency(summary.currentBalance)}
              </p>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{formatDate(payment.date)}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {payment.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[payment.status].bg} ${statusConfig[payment.status].text}`}>
                    {statusConfig[payment.status].label}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{payment.description}</p>
                    <p className="text-sm text-slate-500">No. {payment.appointmentNo}</p>
                  </div>
                  <div className="text-right">
                    {payment.type === 'debit' ? (
                      <div>
                        <p className="text-sm text-red-600 font-medium">DR</p>
                        <p className="text-lg font-bold text-red-700">{formatCurrency(payment.debit)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">CR</p>
                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(payment.credit)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Balance:</span>
                    <span className={`font-semibold ${payment.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(payment.balance)}
                    </span>
                  </div>
                  {payment.type === 'credit' && payment.creditDate && (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Paid on {formatDate(payment.creditDate)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
