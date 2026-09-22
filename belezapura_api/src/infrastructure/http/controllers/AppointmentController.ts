import { Response } from 'express';
import { CreateAppointmentUseCase } from '../../../domain/appointments/useCases/CreateAppointment';
import { PrismaAppointmentRepository } from '../../database/prisma/repositories/PrismaAppointmentRepository';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AppointmentController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const repository = new PrismaAppointmentRepository();
      const createAppointmentUseCase = new CreateAppointmentUseCase(repository);

      const appointment = await createAppointmentUseCase.execute({
        ...req.body,
        salonId,
      });

      // 4. Retornamos o resultado
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const salonId = req.user?.salonId;
      if (!salonId) {
        res.status(401).json({ error: 'Acesso negado: Salon ID não encontrado.' });
        return;
      }

      const repository = new PrismaAppointmentRepository();
      const appointments = await repository.findAll(salonId);
      res.status(200).json(appointments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
