import { Appointment, CreateAppointmentDTO } from '../entities/Appointment';

// Princípio de Inversão de Dependência (SOLID)
// A nossa regra de negócio depende desta interface, e NÃO do Prisma.
export interface IAppointmentRepository {
  create(data: CreateAppointmentDTO): Promise<Appointment>;
  findById(id: string, salonId: string): Promise<Appointment | null>;
  findAll(salonId: string): Promise<Appointment[]>;
  findByProfessionalAndDate(professionalId: string, date: Date, salonId: string): Promise<Appointment[]>;
  updateStatus(id: string, status: string, salonId: string): Promise<Appointment>;
}
