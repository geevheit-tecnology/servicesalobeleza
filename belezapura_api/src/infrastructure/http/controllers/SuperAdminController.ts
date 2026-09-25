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

      const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'ACTIVE' }
      });
      const mrrValue = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.price), 0);

      const mrrData = [
        { name: "Jul", value: 0 },
        { name: "Ago", value: 0 },
        { name: "Set", value: 0 },
        { name: "Out", value: mrrValue }
      ];

      res.json({
        totalSalons,
        totalAppointments,
        totalClients,
        mrrData,
        mrrValue
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
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: { appointments: true }
          }
        }
      });

      const formatted = salons.map(s => {
        const currentSub = s.subscriptions[0];
        return {
          id: s.id,
          name: s.name,
          owner: s.users.length > 0 ? s.users[0]?.name : 'Sem dono',
          units: 1,
          plan: currentSub?.planId || 'Sem plano',
          status: currentSub?.status || 'INACTIVE',
          since: s.createdAt.toLocaleDateString('pt-BR'),
          appointments: s._count.appointments,
          lastAccess: s.updatedAt.toLocaleDateString('pt-BR')
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch salons' });
    }
  }

  async getSettings(req: Request, res: Response) {
    try {
      let settings = await prisma.systemSettings.findFirst();
      if (!settings) {
        settings = await prisma.systemSettings.create({ data: {} });
      }
      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      let settings = await prisma.systemSettings.findFirst();
      if (settings) {
        settings = await prisma.systemSettings.update({
          where: { id: settings.id },
          data
        });
      } else {
        settings = await prisma.systemSettings.create({ data });
      }
      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  async getPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
      res.json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  }

  async createPlan(req: Request, res: Response) {
    try {
      const plan = await prisma.plan.create({ data: req.body });
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create plan' });
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plan = await prisma.plan.update({ where: { id }, data: req.body });
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update plan' });
    }
  }

  async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.plan.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete plan' });
    }
  }

}
