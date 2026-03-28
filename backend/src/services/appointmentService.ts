import { Appointment, IAppointment, Patient, User } from '../models';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export interface CreateAppointmentData {
  patientId: string;
  dentistId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration?: number;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
}

export interface AppointmentQueryParams {
  page?: number;
  limit?: number;
  patientId?: string;
  dentistId?: string;
  status?: string;
  date?: string;
}

export const appointmentService = {
  async create(data: CreateAppointmentData): Promise<IAppointment> {
    // Check if patient exists
    const patient = await Patient.findById(data.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Check if dentist exists
    const dentist = await User.findById(data.dentistId);
    if (!dentist || dentist.role !== 'doctor') {
      throw new AppError('Dentist not found', 404);
    }

    // Check for double booking
    const existingAppointment = await Appointment.findOne({
      dentistId: data.dentistId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: { $nin: ['cancelled'] },
    });

    if (existingAppointment) {
      throw new AppError('Time slot already booked for this dentist', 400);
    }

    const appointment = await Appointment.create({
      ...data,
      status: 'scheduled',
      isCheckedIn: false,
      reminderSent: false,
    });

    // Update patient's last visit if this is their first appointment
    const appointmentCount = await Appointment.countDocuments({ patientId: data.patientId });
    if (appointmentCount === 1) {
      await Patient.findByIdAndUpdate(data.patientId, {
        isFrequent: true,
        status: 'regular',
      });
    }

    logger.info(`Appointment created: ${appointment._id}`);
    return appointment;
  },

  async findById(id: string): Promise<IAppointment> {
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name telephone qrCode')
      .populate('dentistId', 'name specialization');

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    return appointment;
  },

  async findAll(params: AppointmentQueryParams): Promise<{ appointments: IAppointment[]; total: number }> {
    const { page = 1, limit = 10, patientId, dentistId, status, date } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (patientId) query.patientId = patientId;
    if (dentistId) query.dentistId = dentistId;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name telephone qrCode')
      .populate('dentistId', 'name specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    return { appointments, total };
  },

  async getToday(): Promise<IAppointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] },
    })
      .populate('patientId', 'name telephone qrCode')
      .populate('dentistId', 'name specialization')
      .sort({ appointmentTime: 1 });
  },

  async getWeek(): Promise<IAppointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return Appointment.find({
      appointmentDate: { $gte: today, $lt: nextWeek },
      status: { $nin: ['cancelled'] },
    })
      .populate('patientId', 'name telephone qrCode')
      .populate('dentistId', 'name specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
  },

  async update(id: string, data: UpdateAppointmentData): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    logger.info(`Appointment updated: ${id}`);
    return appointment;
  },

  async cancel(id: string): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    logger.info(`Appointment cancelled: ${id}`);
    return appointment;
  },

  async checkIn(id: string): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          isCheckedIn: true,
          checkedInAt: new Date(),
          status: 'confirmed',
        },
      },
      { new: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Update patient's last visit
    await Patient.findByIdAndUpdate(appointment.patientId, { lastVisit: new Date() });

    logger.info(`Patient checked in: ${id}`);
    return appointment;
  },

  async findByPatientToday(patientId: string): Promise<IAppointment | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Appointment.findOne({
      patientId: new mongoose.Types.ObjectId(patientId),
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] },
    }).populate('patientId', 'name telephone qrCode');
  },

  async getUpcomingReminders(): Promise<IAppointment[]> {
    const reminderInterval = parseInt(process.env.REMINDER_INTERVAL_MINUTES || '30', 10);
    const now = new Date();
    const futureTime = new Date(now.getTime() + reminderInterval * 60 * 1000);

    return Appointment.find({
      appointmentDate: now,
      appointmentTime: {
        $gte: now.toTimeString().substring(0, 5),
        $lte: futureTime.toTimeString().substring(0, 5),
      },
      status: { $nin: ['completed', 'cancelled'] },
      reminderSent: false,
      isCheckedIn: false,
    })
      .populate('patientId', 'name telephone')
      .populate('dentistId', 'name');
  },

  async markReminderSent(id: string): Promise<void> {
    await Appointment.findByIdAndUpdate(id, { reminderSent: true });
  },
};

export default appointmentService;
