import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import { getAppointmentsQuerySchema } from '../validators/appointment.validator.js';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/appointments', validate(getAppointmentsQuerySchema), adminController.getAllAppointments);

export default router;
