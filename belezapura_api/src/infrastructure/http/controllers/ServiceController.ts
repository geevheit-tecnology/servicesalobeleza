import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  typeof id === 'string' ? id : undefined;

const getDeleteMode = (mode: unknown): 'delete' | 'inactive' =>
  mode === 'inactive' ? 'inactive' : 'delete';

export class ServiceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const { name, price, duration, status } = req.body;

      if (!name || price === undefined || duration === undefined) {
        res.status(400).json({ error: 'Nome, preço e duração são obrigatórios.' });
        return;
      }

      const service = await prisma.service.create({
        data: {
          name,
          price: parseFloat(price.toString().replace(',', '.')),
          duration: parseInt(duration, 10),
          salonId,
        }
      });

      res.status(201).json(service);
    } catch (error: any) {
      console.error('[Service Create Error]', error);
      res.status(500).json({ error: 'Erro interno ao criar serviço.' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const id = getRouteId(req.params.id);
      const { name, price, duration } = req.body;

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      if (!id) {
        res.status(400).json({ error: 'ID do serviço é obrigatório.' });
        return;
      }

      const service = await prisma.service.findFirst({
        where: { id, salonId }
      });

      if (!service) {
        res.status(404).json({ error: 'Serviço não encontrado.' });
        return;
      }

      const updated = await prisma.service.update({
        where: { id },
        data: {
          name: name ?? service.name,
          price: price !== undefined ? parseFloat(price.toString().replace(',', '.')) : service.price,
          duration: duration !== undefined ? parseInt(duration, 10) : service.duration,
          status: status ?? service.status,
        }
      });

      res.status(200).json(updated);
    } catch (error: any) {
      console.error('[Service Update Error]', error);
      res.status(500).json({ error: 'Erro interno ao atualizar serviço.' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const id = getRouteId(req.params.id);
      const mode = getDeleteMode(req.query.mode);

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      if (!id) {
        res.status(400).json({ error: 'ID do serviço é obrigatório.' });
        return;
      }

      const service = await prisma.service.findFirst({
        where: { id, salonId }
      });

      if (!service) {
        res.status(404).json({ error: 'Serviço não encontrado.' });
        return;
      }

      const appointmentsCount = await prisma.appointment.count({
        where: { serviceId: id, salonId }
      });

      if (mode === 'inactive') {
        const inactive = await prisma.service.update({
          where: { id },
          data: { status: 'inactive' }
        });
        res.status(200).json(inactive);
        return;
      }

      if (appointmentsCount > 0) {
        const deleted = await prisma.service.update({
          where: { id },
          data: { status: 'deleted' }
        });
        res.status(200).json(deleted);
        return;
      }

      await prisma.service.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('[Service Delete Error]', error);
      res.status(500).json({ error: 'Erro interno ao excluir serviço.' });
    }
  }
}
