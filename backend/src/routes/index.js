import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import providerRoutes from './provider.routes.js';
import serviceRoutes from './service.routes.js';
import slotRoutes from './slot.routes.js';
import appointmentRoutes from './appointment.routes.js';
import adminRoutes from './admin.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/providers', providerRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/slots', slotRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
