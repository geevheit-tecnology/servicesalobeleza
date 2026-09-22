import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o Seed (povoamento) do banco de dados (SaaS Mode)...');

  // 1. Criar Salão (Tenant)
  const salon1 = await prisma.salon.create({
    data: {
      name: 'Beleza Pura Matriz',
      slug: 'beleza-pura-matriz',
      document: '12.345.678/0001-99',
    },
  });

  // 2. Criar Admin (Dono)
  const passwordHash = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      name: 'Getulio (Dono)',
      email: 'admin@belezapura.com',
      password: passwordHash,
      role: 'owner',
      salonId: salon1.id,
    },
  });

  // 3. Criar Cliente
  const client1 = await prisma.client.create({
    data: {
      name: 'Fernanda Lima',
      phone: '(11) 98765-1234',
      visits: 24,
      totalSpent: 3240,
      tags: ['VIP'],
      salonId: salon1.id,
    },
  });

  // 4. Criar Profissional
  const pro1 = await prisma.professional.create({
    data: {
      name: 'Ana Carvalho',
      specialty: 'Cabelos',
      commission: 40.0,
      salonId: salon1.id,
    },
  });

  // 5. Criar Serviço
  const service1 = await prisma.service.create({
    data: {
      name: 'Escova Progressiva',
      price: 180.0,
      duration: 120, // 2 horas
      salonId: salon1.id,
    },
  });

  // 6. Criar Agendamento (Appointment)
  await prisma.appointment.create({
    data: {
      salonId: salon1.id,
      clientId: client1.id,
      professionalId: pro1.id,
      serviceId: service1.id,
      date: new Date(),
      value: 180.0,
      paymentMethod: 'PIX',
      status: 'confirmed',
    },
  });

  console.log('✅ Banco populado com sucesso (Multi-tenant)!');

  // 7. Criar o Super Admin
  const hashedAdminPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@beautyos.app' },
    update: {},
    create: {
      email: 'admin@beautyos.app',
      password: hashedAdminPassword,
      name: 'Admin BeautyOS',
      role: 'superadmin',
    }
  });

  console.log('✅ Super Admin criado (admin@beautyos.app / 123456)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
