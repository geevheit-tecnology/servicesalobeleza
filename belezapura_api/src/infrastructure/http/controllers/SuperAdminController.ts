import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  typeof id === 'string' ? id : undefined;

const normalizeSubscriptionStatus = (status: unknown): string | null => {
  if (typeof status !== 'string') return null;
  const normalized = status.toUpperCase();
  if (['ACTIVE', 'TRIAL', 'PENDING', 'BLOCKED', 'LATE'].includes(normalized)) {
    return normalized === 'PENDING' ? 'TRIAL' : normalized;
  }
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'CANCELED';
  return null;
};

const normalizePlanData = (body: any) => {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const price = Number(body?.price ?? 0);
  const features = Array.isArray(body?.features)
    ? body.features.filter((feature: unknown) => typeof feature === 'string' && feature.trim()).map((feature: string) => feature.trim())
    : [];

  if (!name) return null;

  return {
    name,
    price: Number.isFinite(price) ? price : 0,
    period: typeof body?.period === 'string' && body.period.trim() ? body.period.trim() : '/mês',
    highlight: Boolean(body?.highlight),
    features,
    maxProfessionals: Number.isFinite(Number(body?.maxProfessionals)) ? Number(body.maxProfessionals) : 0,
    color: typeof body?.color === 'string' && body.color.trim() ? body.color.trim() : '#000000'
  };
};

const getActor = async (req: Request) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    return { userId: null, userName: 'SuperAdmin' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });

  return {
    userId,
    userName: user?.name || user?.email || 'SuperAdmin'
  };
};

const writeAuditLog = async (
  req: Request,
  action: string,
  resource: string,
  detail: string,
  level: 'info' | 'success' | 'warning' | 'danger' = 'info'
) => {
  try {
    const actor = await getActor(req);
    await prisma.adminAuditLog.create({
      data: {
        action,
        userId: actor.userId,
        userName: actor.userName,
        resource,
        detail,
        level
      }
    });
  } catch (error) {
    console.error('[AdminAuditLog]', error);
  }
};

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

  async blockSalon(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'Salon ID is required' });
        return;
      }

      const salon = await prisma.salon.findUnique({
        where: { id }
      });

      const subscription = salon
        ? await prisma.subscription.findFirst({
            where: { salonId: salon.id },
            orderBy: { createdAt: 'desc' }
          })
        : null;

      if (!salon) {
        res.status(404).json({ error: 'Salão não encontrado.' });
        return;
      }

      if (!subscription) {
        res.status(409).json({ error: 'Salão sem assinatura para bloquear.' });
        return;
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'BLOCKED' }
      });
      await writeAuditLog(req, 'BLOCK_SALON', salon.name, 'Salão bloqueado pelo superadmin.', 'warning');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to block salon' });
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
      await writeAuditLog(req, 'SETTINGS_UPDATE', 'Configurações', 'Configurações da plataforma atualizadas.');
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
      const data = normalizePlanData(req.body);
      if (!data) {
        res.status(400).json({ error: 'Nome do plano é obrigatório.' });
        return;
      }

      const plan = await prisma.plan.create({ data });
      await writeAuditLog(req, 'PLAN_CREATED', plan.name, 'Plano criado pelo superadmin.', 'success');
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create plan' });
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'Plan ID is required' });
        return;
      }

      const data = normalizePlanData(req.body);
      if (!data) {
        res.status(400).json({ error: 'Nome do plano é obrigatório.' });
        return;
      }

      const plan = await prisma.plan.update({ where: { id }, data });
      await writeAuditLog(req, 'PLAN_UPDATE', plan.name, 'Plano atualizado pelo superadmin.');
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update plan' });
    }
  }

  async deletePlan(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'Plan ID is required' });
        return;
      }

      const plan = await prisma.plan.delete({ where: { id } });
      await writeAuditLog(req, 'PLAN_DELETED', plan.name, 'Plano removido pelo superadmin.', 'warning');
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete plan' });
    }
  }

  async getSubscriptions(req: Request, res: Response) {
    try {
      const subs = await prisma.subscription.findMany({
        include: { salon: true, plan: true },
        orderBy: { createdAt: 'desc' }
      });
      const formatted = subs.map(s => ({
        id: s.id,
        salon: s.salon.name,
        salonId: s.salonId,
        document: s.salon.document || 'Não informado',
        plan: s.plan?.name || 'Sem plano',
        value: `R$ ${s.price}`,
        status: s.status,
        next: s.status === 'ACTIVE' ? 'Próximo mês' : '—',
      }));
      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  }

  async updateSubscriptionStatus(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      const { status } = req.body;
      const normalizedStatus = normalizeSubscriptionStatus(status);
      if (!id) {
        res.status(400).json({ error: 'Subscription ID is required' });
        return;
      }
      if (!normalizedStatus) {
        res.status(400).json({ error: 'Status inválido.' });
        return;
      }

      const sub = await prisma.subscription.update({
        where: { id },
        data: { status: normalizedStatus }
      });
      await writeAuditLog(req, 'SUBSCRIPTION_STATUS_UPDATE', sub.id, `Assinatura alterada para ${normalizedStatus}.`);
      res.json(sub);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update subscription status' });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { salonId: null },
            { role: 'superadmin' }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json(users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        last: user.updatedAt.toLocaleDateString('pt-BR')
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role, status } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          password: passwordHash,
          role: role || 'admin',
          status: status || 'active',
          salonId: null
        }
      });
      await writeAuditLog(req, 'USER_CREATED', user.email, 'Usuário administrativo criado.', 'success');

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        last: user.updatedAt.toLocaleDateString('pt-BR')
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
        return;
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const { name, email, password, role, status } = req.body;
      const data: any = {};
      if (typeof name === 'string' && name.trim()) data.name = name.trim();
      if (typeof email === 'string' && email.trim()) data.email = email.trim().toLowerCase();
      if (typeof role === 'string' && role.trim()) data.role = role.trim();
      if (typeof status === 'string' && status.trim()) data.status = status.trim();
      if (typeof password === 'string' && password.trim()) {
        data.password = await bcrypt.hash(password.trim(), 10);
      }

      const user = await prisma.user.update({ where: { id }, data });
      await writeAuditLog(req, 'USER_UPDATED', user.email, 'Usuário administrativo atualizado.');
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        last: user.updatedAt.toLocaleDateString('pt-BR')
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = getRouteId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await prisma.user.delete({ where: { id } });
      await writeAuditLog(req, 'USER_DELETED', user.email, 'Usuário administrativo removido.', 'warning');
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200
      });

      res.json(logs.map(log => ({
        id: log.id,
        action: log.action,
        user: log.userName || 'Sistema',
        resource: log.resource,
        detail: log.detail,
        level: log.level,
        time: log.createdAt.toLocaleString('pt-BR')
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }

}
