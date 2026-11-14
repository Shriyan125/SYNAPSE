import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentsQuerySchema,
} from '../validators/appointment.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(getAppointmentsQuerySchema), appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment);
router.patch(
  '/:id/reschedule',
  validate(rescheduleAppointmentSchema),
  appointmentController.rescheduleAppointment
);
router.patch(
  '/:id/cancel',
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

export default router;
