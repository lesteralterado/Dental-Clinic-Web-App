import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Patient, Appointment, Payment } from '../models';
import { User } from '../models/User';

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get counts
      const totalPatients = await Patient.countDocuments();
      const todayAppointments = await Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
        status: { $nin: ['cancelled'] },
      });
      const completedToday = await Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
        status: 'completed',
      });

      // Get payments for today
      const todayPayments = await Payment.find({
        date: { $gte: today, $lt: tomorrow },
        status: 'completed',
      });

      const totalRevenue = todayPayments.reduce((sum, p) => sum + (p.credit || 0), 0);

      // Get recent patients
      const recentPatients = await Patient.find()
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        stats: {
          totalPatients,
          todayAppointments,
          completedToday,
          totalRevenue,
        },
        recentPatients,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async getTodayAppointments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { $nin: ['cancelled'] },
      })
        .populate('patientId', 'name telephone qrCode')
        .populate('dentistId', 'name specialization')
        .sort({ appointmentTime: 1 });

      res.json({ appointments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default dashboardController;
