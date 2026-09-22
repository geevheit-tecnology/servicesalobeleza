import { Request, Response } from 'express';
import { prisma } from '../../database/prisma'; // ou o path correto pro prisma
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export class PublicController {
  // Retorna os dados públicos de um salão pelo slug
  async getSalonBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      const salon = await db.salon.findUnique({
        where: { slug: slug as string },
        include: {
          services: true,
          professionals: {
            where: { status: 'active' }
          }
        }
      });

      if (!salon) {
        res.status(404).json({ error: 'Salão não encontrado.' });
        return;
      }

      res.status(200).json(salon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Permite que o cliente final agende sem estar logado
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { salonId, clientName, clientPhone, serviceId, professionalId, date } = req.body;

      if (!salonId || !clientName || !serviceId || !professionalId || !date) {
        res.status(400).json({ error: 'Dados obrigatórios faltando.' });
        return;
      }

      // 1. Busca o serviço para saber o valor
      const service = await db.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        res.status(404).json({ error: 'Serviço não encontrado.' });
        return;
      }

      // 2. Busca ou cria o cliente pelo telefone/nome
      let client = await db.client.findFirst({
        where: { salonId, phone: clientPhone }
      });

      if (!client) {
        client = await db.client.create({
          data: {
            salonId,
            name: clientName,
            phone: clientPhone,
          }
        });
      }

      // 3. Cria o agendamento
      const appointment = await db.appointment.create({
        data: {
          salonId,
          clientId: client.id,
          professionalId,
          serviceId,
          date: new Date(date),
          value: service.price,
          status: 'waiting', // aguardando confirmação/pagamento
        }
      });

      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
