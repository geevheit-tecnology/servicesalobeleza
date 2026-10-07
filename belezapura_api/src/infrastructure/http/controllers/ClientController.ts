import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../../database/prisma';

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  typeof id === 'string' ? id : undefined;

const getDeleteMode = (mode: unknown): 'delete' | 'inactive' =>
  mode === 'inactive' ? 'inactive' : 'delete';

export class ClientController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const { name, phone, tags, status } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
        return;
      }

      // Prevenir duplicidade por telefone no mesmo salão (apenas se telefone for fornecido)
      if (phone) {
        const existing = await prisma.client.findFirst({
          where: { salonId, phone }
        });
        if (existing) {
          res.status(409).json({ error: 'Já existe um cliente cadastrado com este telefone neste salão.' });
          return;
        }
      }

      const client = await prisma.client.create({
        data: {
          salonId,
          name: name.trim(),
          phone: phone || null,
          tags: tags || []
        }
      });

      res.status(201).json(client);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar cliente: ' + error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const id = getRouteId(req.params.id);
      const { name, phone, tags } = req.body;

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado.' });
        return;
      }

      if (!id) {
        res.status(400).json({ error: 'ID do cliente é obrigatório.' });
        return;
      }

      const existingClient = await prisma.client.findUnique({ where: { id } });
      if (!existingClient || existingClient.salonId !== salonId) {
        res.status(404).json({ error: 'Cliente não encontrado.' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
        return;
      }

      if (phone && phone !== existingClient.phone) {
        const duplicate = await prisma.client.findFirst({
          where: { salonId, phone, id: { not: id } }
        });
        if (duplicate) {
          res.status(409).json({ error: 'Já existe outro cliente com este telefone.' });
          return;
        }
      }

      const updated = await prisma.client.update({
        where: { id },
        data: {
          name: name.trim(),
          phone: phone || null,
          tags: tags || existingClient.tags,
          status: status ?? existingClient.status
        }
      });

      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao atualizar cliente: ' + error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      const id = getRouteId(req.params.id);
      const mode = getDeleteMode(req.query.mode);

      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado.' });
        return;
      }

      if (!id) {
        res.status(400).json({ error: 'ID do cliente é obrigatório.' });
        return;
      }

      const client = await prisma.client.findUnique({ where: { id } });
      if (!client || client.salonId !== salonId) {
        res.status(404).json({ error: 'Cliente não encontrado.' });
        return;
      }

      const appointmentsCount = await prisma.appointment.count({
        where: { clientId: id, salonId }
      });

      if (mode === 'inactive') {
        const inactive = await prisma.client.update({
          where: { id },
          data: { status: 'inactive' }
        });
        res.status(200).json(inactive);
        return;
      }

      if (appointmentsCount > 0) {
        const deleted = await prisma.client.update({
          where: { id },
          data: { status: 'deleted' }
        });
        res.status(200).json(deleted);
        return;
      }

      await prisma.client.delete({ where: { id } });

      res.status(200).json({ message: 'Cliente excluído com sucesso.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao excluir cliente: ' + error.message });
    }
  }
}
