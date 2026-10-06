import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const db = new PrismaClient();

export class OnboardingController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { salonName, email, password, services, professionals, planId } = req.body;

      if (!salonName || !email || !password) {
        res.status(400).json({ error: 'Nome do salão, e-mail e senha são obrigatórios.' });
        return;
      }

      // Generate a simple slug
      let slug = salonName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      // Check if slug exists
      const existing = await db.salon.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Verify and fetch plan details
      let validPlanId = planId;
      let planPrice = 0.0;
      if (planId) {
        const plan = await db.plan.findUnique({ where: { id: planId } });
        if (plan) {
          planPrice = Number(plan.price);
        } else {
          validPlanId = null; // Plan not found
        }
      }

      // If no valid plan, fallback to a default plan if it exists
      if (!validPlanId) {
        const defaultPlan = await db.plan.findFirst();
        if (defaultPlan) {
          validPlanId = defaultPlan.id;
          planPrice = Number(defaultPlan.price);
        }
      }

      // Perform a massive transaction to create the tenant
      const salon = await db.salon.create({
        data: {
          name: salonName,
          slug,
          users: {
            create: {
              name: 'Administrador',
              email,
              password: passwordHash,
              role: 'owner'
            }
          },
          services: {
            create: (services || []).map((s: any) => ({
              name: s.name,
              price: parseFloat((s.price || "0").toString().replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
              duration: parseInt(s.duration) || 60
            }))
          },
          professionals: {
            create: (professionals || []).map((p: any) => ({
              name: p.name,
              specialty: p.specialty,
              status: 'active'
            }))
          },
          ...(validPlanId ? {
            subscriptions: {
              create: {
                planId: validPlanId,
                status: 'TRIAL',
                price: planPrice
              }
            }
          } : {})
        },
        include: {
          users: true
        }
      });

      // Generate JWT for auto-login
      const token = jwt.sign(
        { userId: salon.users[0]?.id, salonId: salon.id },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '1d' }
      );

      res.status(201).json({ 
        salon, 
        token, 
        user: { 
          salonSlug: salon.slug, 
          role: salon.users[0]?.role 
        } 
      });
    } catch (error: any) {
      console.error('[Onboarding Error]', error);
      res.status(500).json({ error: 'Erro ao criar o salão.' });
    }
  }
}
