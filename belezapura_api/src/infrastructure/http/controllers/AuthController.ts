import { Request, Response } from 'express';
import { LoginUseCase } from '../../../../domain/auth/useCases/LoginUseCase';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const loginUseCase = new LoginUseCase();
      const result = await loginUseCase.execute(email, password);
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
