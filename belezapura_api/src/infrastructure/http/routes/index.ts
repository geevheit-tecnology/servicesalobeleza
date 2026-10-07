import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AuthController } from '../controllers/AuthController';
import { PublicController } from '../controllers/PublicController';
import { OnboardingController } from '../controllers/OnboardingController';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { SalonController } from '../controllers/SalonController';
import { ServiceController } from '../controllers/ServiceController';
import { ProfessionalController } from '../controllers/ProfessionalController';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware, superAdminMiddleware } from '../middlewares/authMiddleware';

export const routes = Router();

const appointmentController = new AppointmentController();
const authController = new AuthController();
const publicController = new PublicController();
const onboardingController = new OnboardingController();
const superAdminController = new SuperAdminController();
const salonController = new SalonController();
const serviceController = new ServiceController();
const professionalController = new ProfessionalController();
const clientController = new ClientController();

// Rotas Abertas (Públicas)
routes.post('/auth/login', (req, res) => authController.login(req, res));
routes.post('/public/onboarding', (req, res) => onboardingController.register(req, res));

routes.get('/public/salons/:slug', (req, res) => publicController.getSalonBySlug(req, res));
routes.post('/public/appointments', (req, res) => publicController.createAppointment(req, res));
routes.get('/public/availability', (req, res) => publicController.getAvailability(req, res));
routes.get('/public/plans', (req, res) => superAdminController.getPlans(req, res));

// Rotas Protegidas (Exigem JWT de um usuário logado)
routes.use(authMiddleware as any); // Protege as rotas abaixo

// Rotas de Agendamentos
routes.post('/appointments', (req, res) => appointmentController.create(req, res));
routes.get('/appointments', (req, res) => appointmentController.listAll(req, res));

// Rotas do Salão (Dono)
routes.get('/salon/dashboard', (req, res) => salonController.getDashboard(req, res));
routes.get('/salon/details', (req, res) => salonController.getDetails(req, res));
routes.get('/salon/clients', (req, res) => salonController.getClients(req, res));

routes.post('/services', (req, res) => serviceController.create(req, res));
routes.put('/services/:id', (req, res) => serviceController.update(req, res));
routes.delete('/services/:id', (req, res) => serviceController.delete(req, res));

routes.post('/professionals', (req, res) => professionalController.create(req, res));
routes.put('/professionals/:id', (req, res) => professionalController.update(req, res));
routes.delete('/professionals/:id', (req, res) => professionalController.delete(req, res));

routes.post('/salon/clients', (req, res) => clientController.create(req, res));
routes.put('/salon/clients/:id', (req, res) => clientController.update(req, res));
routes.delete('/salon/clients/:id', (req, res) => clientController.delete(req, res));

// Rotas do Super Admin
routes.use('/superadmin', superAdminMiddleware as any);
routes.get('/superadmin/overview', (req, res) => superAdminController.getOverview(req, res));
routes.get('/superadmin/salons', (req, res) => superAdminController.getSalons(req, res));
routes.put('/superadmin/salons/:id/block', (req, res) => superAdminController.blockSalon(req, res));
routes.get('/superadmin/settings', (req, res) => superAdminController.getSettings(req, res));
routes.put('/superadmin/settings', (req, res) => superAdminController.updateSettings(req, res));
routes.get('/superadmin/plans', (req, res) => superAdminController.getPlans(req, res));
routes.post('/superadmin/plans', (req, res) => superAdminController.createPlan(req, res));
routes.put('/superadmin/plans/:id', (req, res) => superAdminController.updatePlan(req, res));
routes.delete('/superadmin/plans/:id', (req, res) => superAdminController.deletePlan(req, res));

routes.get('/superadmin/subscriptions', (req, res) => superAdminController.getSubscriptions(req, res));
routes.put('/superadmin/subscriptions/:id/status', (req, res) => superAdminController.updateSubscriptionStatus(req, res));
routes.get('/superadmin/users', (req, res) => superAdminController.getUsers(req, res));
routes.post('/superadmin/users', (req, res) => superAdminController.createUser(req, res));
routes.put('/superadmin/users/:id', (req, res) => superAdminController.updateUser(req, res));
routes.delete('/superadmin/users/:id', (req, res) => superAdminController.deleteUser(req, res));
routes.get('/superadmin/audit-logs', (req, res) => superAdminController.getAuditLogs(req, res));
