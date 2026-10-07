import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    salonId: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Token malformado.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key-belezapura';
    const decoded = jwt.verify(token, secret) as unknown as { userId: string; salonId: string; role: string };
    
    // Injeta os dados do usuário na requisição para isolarmos os dados por Salão!
    req.user = decoded;
    
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function superAdminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso restrito ao superadmin.' });
  }

  return next();
}
