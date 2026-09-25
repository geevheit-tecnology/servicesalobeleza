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
          status: 'PENDING_PAYMENT', // Modificado para exigir pagamento
        }
      });

      // 4. Mock de Geração de PIX (Gateway Simulator)
      const pixCode = `00020126360014br.gov.bcb.pix0114+55119999999995204000053039865405${service.price}5802BR5910BeautyOS6009SaoPaulo62070503***6304ABCD`;

      res.status(201).json({ appointment, pixCode });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Verifica a disponibilidade do profissional em uma data específica
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { date, professionalId, serviceId } = req.query;

      if (!date || !professionalId || !serviceId) {
        res.status(400).json({ error: 'Faltam parâmetros (date, professionalId, serviceId)' });
        return;
      }

      const service = await db.service.findUnique({ where: { id: String(serviceId) } });
      if (!service) {
        res.status(404).json({ error: 'Serviço não encontrado' });
        return;
      }

      const startOfDay = new Date(String(date));
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(String(date));
      endOfDay.setHours(23, 59, 59, 999);

      // Busca todos os agendamentos do profissional no dia
      const appointments = await db.appointment.findMany({
        where: {
          professionalId: String(professionalId),
          date: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ['CANCELED'] }
        },
        include: { service: true }
      });

      // Horário de funcionamento do salão (Hardcoded 09:00 - 18:00 para MVP)
      const slots: string[] = [];
      let currentHour = 9;
      let currentMinute = 0;

      while (currentHour < 18) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(currentHour, currentMinute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

        // Verifica colisão
        const hasConflict = appointments.some(app => {
          const appStart = app.date;
          const appEnd = new Date(appStart.getTime() + app.service.duration * 60000);
          return (slotStart < appEnd && slotEnd > appStart);
        });

        // Se terminar antes das 18h e não houver conflito, adiciona
        if (!hasConflict && slotEnd.getHours() <= 18 && (slotEnd.getHours() < 18 || slotEnd.getMinutes() === 0)) {
          slots.push(slotStart.toISOString());
        }

        // Avança 30 minutos
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
      }

      res.status(200).json({ slots });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
