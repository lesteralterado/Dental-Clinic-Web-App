import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import patientService from '../services/patientService';

export const patientController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientService.create(req.body);
      res.status(201).json({ message: 'Patient created', patient });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientService.findById(req.params.id);
      res.json({ patient });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const result = await patientService.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        status: status as string,
      });
      res.json({
        patients: result.patients,
        total: result.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      const result = await patientService.findAll({
        page: 1,
        limit: 20,
        search: q as string,
      });
      res.json({ patients: result.patients });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getRecent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const patients = await patientService.getRecent(Number(limit));
      res.json({ patients });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getFrequent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patients = await patientService.getFrequent();
      res.json({ patients });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patient = await patientService.update(req.params.id, req.body);
      res.json({ message: 'Patient updated', patient });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await patientService.delete(req.params.id);
      res.json({ message: 'Patient deleted' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getQrCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const qrCode = await patientService.generateQrCode(req.params.id);
      res.json({ qrCode });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async findByQrCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { qr } = req.query;
      const patient = await patientService.findByQrCode(qr as string);
      res.json({ patient });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

export default patientController;
