import { Payment, PaymentResponse } from '@/lib/types';

// Mock Payments Data - payment history for patients
export const mockPayments: Payment[] = [
  // Maria Santos (p1) - payment history
  {
    id: 'pay1',
    patientId: 'p1',
    appointmentNo: 'APT-001',
    date: '2026-03-15',
    time: '09:00',
    description: 'Regular Checkup',
    type: 'debit',
    debit: 500.00,
    credit: 0,
    balance: 500.00,
    status: 'PENDING',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'pay2',
    patientId: 'p1',
    appointmentNo: 'APT-001',
    date: '2026-03-16',
    time: '10:30',
    description: 'Payment - Cash',
    type: 'credit',
    debit: 0,
    credit: 500.00,
    balance: 0,
    status: 'PAID',
    creditDate: '2026-03-16',
    createdAt: '2026-03-16T10:30:00Z',
    updatedAt: '2026-03-16T10:30:00Z',
  },
  {
    id: 'pay3',
    patientId: 'p1',
    appointmentNo: 'APT-002',
    date: '2026-02-10',
    time: '14:00',
    description: 'Teeth Cleaning',
    type: 'debit',
    debit: 1200.00,
    credit: 0,
    balance: 1200.00,
    status: 'PENDING',
    createdAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'pay4',
    patientId: 'p1',
    appointmentNo: 'APT-002',
    date: '2026-02-11',
    time: '09:00',
    description: 'Payment - GCash',
    type: 'credit',
    debit: 0,
    credit: 1200.00,
    balance: 0,
    status: 'PAID',
    creditDate: '2026-02-11',
    createdAt: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-11T09:00:00Z',
  },

  // John Dela Cruz (p2) - with partial payment
  {
    id: 'pay5',
    patientId: 'p2',
    appointmentNo: 'APT-003',
    date: '2026-03-20',
    time: '09:30',
    description: 'Tooth Extraction',
    type: 'debit',
    debit: 2500.00,
    credit: 0,
    balance: 2500.00,
    status: 'PENDING',
    createdAt: '2026-03-20T09:30:00Z',
    updatedAt: '2026-03-20T09:30:00Z',
  },
  {
    id: 'pay6',
    patientId: 'p2',
    appointmentNo: 'APT-003',
    date: '2026-03-20',
    time: '11:00',
    description: 'Payment - Partial',
    type: 'credit',
    debit: 0,
    credit: 1000.00,
    balance: 1500.00,
    status: 'PARTIAL',
    createdAt: '2026-03-20T11:00:00Z',
    updatedAt: '2026-03-20T11:00:00Z',
  },

  // Robert Martinez (p4) - denture treatment with multiple visits
  {
    id: 'pay7',
    patientId: 'p4',
    appointmentNo: 'APT-004',
    date: '2026-03-01',
    time: '11:00',
    description: 'Denture Consultation',
    type: 'debit',
    debit: 300.00,
    credit: 0,
    balance: 300.00,
    status: 'PAID',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'pay8',
    patientId: 'p4',
    appointmentNo: 'APT-004',
    date: '2026-03-01',
    time: '11:30',
    description: 'Payment - Cash',
    type: 'credit',
    debit: 0,
    credit: 300.00,
    balance: 0,
    status: 'PAID',
    creditDate: '2026-03-01',
    createdAt: '2026-03-01T11:30:00Z',
    updatedAt: '2026-03-01T11:30:00Z',
  },
  {
    id: 'pay9',
    patientId: 'p4',
    appointmentNo: 'APT-005',
    date: '2026-03-18',
    time: '11:00',
    description: 'Denture Fitting - Upper',
    type: 'debit',
    debit: 8000.00,
    credit: 0,
    balance: 8000.00,
    status: 'PENDING',
    createdAt: '2026-03-18T11:00:00Z',
    updatedAt: '2026-03-18T11:00:00Z',
  },

  // Michael Lim (p6) - root canal treatment
  {
    id: 'pay10',
    patientId: 'p6',
    appointmentNo: 'APT-006',
    date: '2026-03-10',
    time: '13:00',
    description: 'Root Canal - First Session',
    type: 'debit',
    debit: 3500.00,
    credit: 0,
    balance: 3500.00,
    status: 'PENDING',
    createdAt: '2026-03-10T13:00:00Z',
    updatedAt: '2026-03-10T13:00:00Z',
  },
  {
    id: 'pay11',
    patientId: 'p6',
    appointmentNo: 'APT-006',
    date: '2026-03-10',
    time: '14:00',
    description: 'Payment - Credit Card',
    type: 'credit',
    debit: 0,
    credit: 3500.00,
    balance: 0,
    status: 'PAID',
    creditDate: '2026-03-10',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },
  {
    id: 'pay12',
    patientId: 'p6',
    appointmentNo: 'APT-007',
    date: '2026-03-24',
    time: '13:00',
    description: 'Root Canal - Second Session',
    type: 'debit',
    debit: 3500.00,
    credit: 0,
    balance: 3500.00,
    status: 'PENDING',
    createdAt: '2026-03-24T13:00:00Z',
    updatedAt: '2026-03-24T13:00:00Z',
  },
];

// Mock Payment Service
export const mockPaymentService = {
  async getByPatientId(patientId: string): Promise<PaymentResponse> {
    const patientPayments = mockPayments
      .filter(p => p.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let totalDebit = 0;
    let totalCredit = 0;
    let currentBalance = 0;

    // Sort by date ascending to calculate running balance
    const sortedPayments = [...patientPayments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const payment of sortedPayments) {
      totalDebit += payment.debit;
      totalCredit += payment.credit;
      currentBalance = payment.balance;
    }

    return {
      payments: patientPayments,
      total: patientPayments.length,
      totalDebit,
      totalCredit,
      currentBalance,
    };
  },

  async create(data: Partial<Payment>): Promise<Payment> {
    const newPayment: Payment = {
      id: `pay${Date.now()}`,
      patientId: data.patientId || '',
      appointmentNo: data.appointmentNo || '',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      description: data.description || '',
      type: data.type || 'debit',
      debit: data.debit || 0,
      credit: data.credit || 0,
      balance: data.balance || 0,
      status: data.status || 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Payment not found');
    }
    mockPayments[index] = {
      ...mockPayments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockPayments[index];
  },
};

export default mockPaymentService;
