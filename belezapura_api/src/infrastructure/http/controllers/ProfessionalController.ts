import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

export class ProfessionalController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const { name, specialty, commission } = req.body;

      const professional = await prisma.professional.create({
        data: {
          name,
          specialty,
          commission: parseFloat(commission || 0),
          salonId,
        }
      });

      res.status(201).json(professional);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
