import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../infrastructure/database/prisma';

export class LoginUseCase {
  async execute(email: string, password: string) {
    // 1. Buscar usuário com informações do salão
    const user = await prisma.user.findUnique({
      where: { email },
      include: { salon: true }
    });

    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    // 2. Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha inválidos.');
    }

    // 3. Gerar JWT Token contendo o salonId e a role
    const secret = process.env.JWT_SECRET || 'super-secret-key-belezapura';
    const token = jwt.sign(
      { userId: user.id, salonId: user.salonId, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        salonId: user.salonId,
        role: user.role,
        salonSlug: user.salon?.slug || null
      },
    };
  }
}
