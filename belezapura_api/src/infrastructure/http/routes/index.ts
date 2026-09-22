import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AuthController } from '../controllers/AuthController';
import { PublicController } from '../controllers/PublicController';
import { OnboardingController } from '../controllers/OnboardingController';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const routes = Router();

const appointmentController = new AppointmentController();
const authController = new AuthController();
const publicController = new PublicController();
const onboardingController = new OnboardingController();
const superAdminController = new SuperAdminController();

// Rotas Abertas (Públicas)
routes.post('/auth/login', (req, res) => authController.login(req, res));
routes.post('/public/onboarding', (req, res) => onboardingController.register(req, res));

routes.get('/public/salons/:slug', (req, res) => publicController.getSalonBySlug(req, res));
routes.post('/public/appointments', (req, res) => publicController.createAppointment(req, res));

// Rotas Protegidas (Exigem JWT de um usuário logado)
routes.use(authMiddleware as any); // Protege as rotas abaixo

// Rotas de Agendamentos
routes.post('/appointments', (req, res) => appointmentController.create(req, res));
routes.get('/appointments', (req, res) => appointmentController.listAll(req, res));

// Rotas do Super Admin
routes.get('/superadmin/overview', (req, res) => superAdminController.getOverview(req, res));
routes.get('/superadmin/salons', (req, res) => superAdminController.getSalons(req, res));
