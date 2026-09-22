import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { Appointment, CreateAppointmentDTO } from '../entities/Appointment';

export class CreateAppointmentUseCase {
  // Injeção de dependência: o caso de uso não sabe SE é Postgres, Prisma, Mongo, etc.
  // Ele apenas exige "alguma coisa" que siga a interface IAppointmentRepository.
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    if (!data.salonId) {
      throw new Error('O agendamento precisa estar associado a um salão.');
    }

    if (data.value <= 0) {
      throw new Error('O valor do agendamento deve ser maior que zero.');
    }

    const today = new Date();
    if (new Date(data.date) < today) {
      throw new Error('Não é possível criar um agendamento no passado.');
    }

    // 2. Regra de Negócio: Impedir choque de horário para o mesmo profissional
    const overlapping = await this.appointmentRepository.findByProfessionalAndDate(
      data.professionalId, 
      new Date(data.date),
      data.salonId
    );
    if (overlapping.length > 0) {
      throw new Error('Este profissional já possui um agendamento neste horário.');
    }

    // 3. Chamar o repositório para salvar no banco
    const appointment = await this.appointmentRepository.create(data);

    // 4. Poderíamos engatilhar outros eventos aqui (ex: enviar email de confirmação)
    
    return appointment;
  }
}
