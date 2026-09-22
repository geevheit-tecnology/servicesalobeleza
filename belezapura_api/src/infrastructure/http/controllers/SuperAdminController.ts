import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SuperAdminController {
  
  async getOverview(req: Request, res: Response) {
    try {
      const [totalSalons, totalAppointments, totalClients] = await Promise.all([
        prisma.salon.count(),
        prisma.appointment.count(),
        prisma.client.count()
      ]);

      const mrrData = [
        { name: "Jul", value: 1000 },
        { name: "Ago", value: 2000 },
        { name: "Set", value: 5000 },
        { name: "Out", value: totalSalons * 149 } // Mock for MRR growth
      ];

      res.json({
        totalSalons,
        totalAppointments,
        totalClients,
        mrrData,
        mrrValue: totalSalons * 149
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch overview' });
    }
  }

  async getSalons(req: Request, res: Response) {
    try {
      const salons = await prisma.salon.findMany({
        include: {
          users: true,
          _count: {
            select: { appointments: true }
          }
        }
      });

      const formatted = salons.map(s => ({
        id: s.id,
        name: s.name,
        owner: s.users.length > 0 ? s.users[0].name : 'Sem dono',
        units: 1,
        plan: 'Profissional', // Mock
        status: 'active', // Mock
        since: s.createdAt.toLocaleDateString('pt-BR'),
        appointments: s._count.appointments,
        lastAccess: 'Hoje'
      }));

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch salons' });
    }
  }

}
