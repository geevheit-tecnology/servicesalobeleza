import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

export class ServiceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const { name, price, duration } = req.body;

      const service = await prisma.service.create({
        data: {
          name,
          price: parseFloat(price),
          duration: parseInt(duration, 10),
          salonId,
        }
      });

      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
