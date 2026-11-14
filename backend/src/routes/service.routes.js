import { Router } from 'express';
import { serviceController } from '../controllers/service.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema } from '../validators/service.validator.js';

const router = Router();

// Public catalog routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// Admin-only management routes
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  validate(createServiceSchema),
  serviceController.createService
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  serviceController.updateService
);

export default router;
