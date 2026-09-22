import { prisma } from '../index';
import { IAppointmentRepository } from '../../../../domain/appointments/repositories/IAppointmentRepository';
import { Appointment, CreateAppointmentDTO } from '../../../../domain/appointments/entities/Appointment';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    const appointment = await prisma.appointment.create({
      data: {
        salonId: data.salonId,
        clientId: data.clientId,
        professionalId: data.professionalId,
        serviceId: data.serviceId,
        date: data.date,
        value: data.value,
        paymentMethod: data.paymentMethod,
        status: data.status,
      },
    });

    return {
      ...appointment,
      value: Number(appointment.value), // Convertendo Decimal do BD para Number no TS
    };
  }

  async findById(id: string, salonId: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id, salonId },
    });
    
    if (!appointment) return null;
    return { ...appointment, value: Number(appointment.value) };
  }

  async findAll(salonId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { salonId },
      include: {
        client: true,
        professional: true,
        service: true,
      }
    });
    
    return appointments.map(app => ({
      ...app,
      value: Number(app.value)
    }));
  }

  async findByProfessionalAndDate(professionalId: string, date: Date, salonId: string): Promise<Appointment[]> {
    // Busca agendamentos do profissional no mesmo salão e horário exato (simplificado)
    const appointments = await prisma.appointment.findMany({
      where: { professionalId, date, salonId }
    });
    return appointments.map(app => ({ ...app, value: Number(app.value) }));
  }

  async updateStatus(id: string, status: string, salonId: string): Promise<Appointment> {
    const appointment = await prisma.appointment.update({
      where: { id, salonId }, // Garante que só altera se for do salão logado
      data: { status },
    });
    return { ...appointment, value: Number(appointment.value) };
  }
}
