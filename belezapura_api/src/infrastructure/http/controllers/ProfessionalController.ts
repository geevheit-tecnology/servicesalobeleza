import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

export class ProfessionalController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const { name, specialty, commission } = req.body;

      if (!name) {
        res.status(400).json({ error: 'O nome do profissional é obrigatório.' });
        return;
      }

      const professional = await prisma.professional.create({
        data: {
          name,
          specialty: specialty || null,
          commission: commission ? parseFloat(commission.toString().replace(',', '.')) : 0,
          salonId,
        }
      });

      res.status(201).json(professional);
    } catch (error: any) {
      console.error('[Professional Create Error]', error);
      res.status(500).json({ error: 'Erro interno ao criar profissional.' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const { id } = req.params;
      const { name, specialty, commission, status } = req.body;

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const professional = await prisma.professional.findFirst({
        where: { id, salonId }
      });

      if (!professional) {
        res.status(404).json({ error: 'Profissional não encontrado.' });
        return;
      }

      const updated = await prisma.professional.update({
        where: { id },
        data: {
          name: name ?? professional.name,
          specialty: specialty ?? professional.specialty,
          commission: commission !== undefined ? parseFloat(commission.toString().replace(',', '.')) : professional.commission,
          status: status ?? professional.status,
        }
      });

      res.status(200).json(updated);
    } catch (error: any) {
      console.error('[Professional Update Error]', error);
      res.status(500).json({ error: 'Erro interno ao atualizar profissional.' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const { id } = req.params;

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const professional = await prisma.professional.findFirst({
        where: { id, salonId },
        include: { appointments: true }
      });

      if (!professional) {
        res.status(404).json({ error: 'Profissional não encontrado.' });
        return;
      }

      if (professional.appointments.length > 0) {
        // Soft delete
        const deactivated = await prisma.professional.update({
          where: { id },
          data: { status: 'deleted' }
        });
        res.status(200).json(deactivated);
        return;
      }

      await prisma.professional.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('[Professional Delete Error]', error);
      res.status(500).json({ error: 'Erro interno ao excluir profissional.' });
    }
  }
}
