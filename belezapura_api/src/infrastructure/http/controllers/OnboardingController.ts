import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const db = new PrismaClient();

export class OnboardingController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { salonName, email, password, services, professionals, schedule, pixKey } = req.body;

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

      // Perform a massive transaction to create the tenant
      const salon = await db.salon.create({
        data: {
          name: salonName,
          slug,
          // document: '', 
          users: {
            create: {
              name: 'Administrador',
              email,
              password: passwordHash
            }
          },
          services: {
            create: services.map((s: any) => ({
              name: s.name,
              price: parseFloat(s.price.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
              duration: parseInt(s.duration) || 60
            }))
          },
          professionals: {
            create: professionals.map((p: any) => ({
              name: p.name,
              specialty: p.specialty,
              status: 'active'
            }))
          }
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

      res.status(201).json({ salon, token });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar o salão.' });
    }
  }
}
