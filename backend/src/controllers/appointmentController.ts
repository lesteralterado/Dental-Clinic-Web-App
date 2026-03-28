import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import appointmentService from '../services/appointmentService';

export const appointmentController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.create(req.body);
      res.status(201).json({ message: 'Appointment created', appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.findById(req.params.id);
      res.json({ appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, patientId, dentistId, status, date } = req.query;
      const result = await appointmentService.findAll({
        page: Number(page),
        limit: Number(limit),
        patientId: patientId as string,
        dentistId: dentistId as string,
        status: status as string,
        date: date as string,
      });
      res.json({
        appointments: result.appointments,
        total: result.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getToday(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointments = await appointmentService.getToday();
      res.json({ appointments });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getWeek(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointments = await appointmentService.getWeek();
      res.json({ appointments });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.update(req.params.id, req.body);
      res.json({ message: 'Appointment updated', appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.cancel(req.params.id);
      res.json({ message: 'Appointment cancelled', appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async checkIn(req: AuthRequest, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.checkIn(req.params.id);
      res.json({ message: 'Patient checked in', appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async checkInByQr(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { qr } = req.query;
      // First find patient by QR code
      const patient = await patientService.findByQrCode(qr as string);
      // Then find today's appointment
      const appointment = await appointmentService.findByPatientToday(patient._id.toString());
      
      if (!appointment) {
        return res.status(404).json({ message: 'No appointment found for today' });
      }
      
      const checkedIn = await appointmentService.checkIn(appointment._id.toString());
      return res.json({ message: 'Patient checked in', appointment: checkedIn });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

import patientService from '../services/patientService';

export default appointmentController;
