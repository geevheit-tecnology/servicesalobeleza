export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: Date;
  value: number; // Decimal in DB, number in TS for simplicity in this example
  paymentMethod: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Para criarmos um agendamento, não enviamos o ID e as datas automáticas
export type CreateAppointmentDTO = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;
