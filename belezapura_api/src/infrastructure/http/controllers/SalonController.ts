import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

export class SalonController {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [appointmentsToday, totalAppointments, servicesCount, prosCount, clientsCount] = await Promise.all([
        prisma.appointment.count({
          where: { salonId, date: { gte: today } }
        }),
        prisma.appointment.count({ where: { salonId } }),
        prisma.service.count({ where: { salonId } }),
        prisma.professional.count({ where: { salonId } }),
        prisma.client.count({ where: { salonId } }),
      ]);

      const appointments = await prisma.appointment.findMany({
        where: { salonId },
        include: { service: true },
      });

      const revenue = appointments.reduce((acc, curr) => acc + Number(curr.value), 0);

      res.status(200).json({
        appointmentsToday,
        totalAppointments,
        revenue,
        servicesCount,
        prosCount,
        clientsCount
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        include: {
          services: true,
          professionals: true,
          clients: true
        }
      });

      res.status(200).json(salon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
