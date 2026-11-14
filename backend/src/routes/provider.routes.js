import { Router } from 'express';
import { providerController } from '../controllers/provider.controller.js';
import { slotController } from '../controllers/slot.controller.js';
import { validate } from '../middleware/validate.js';
import { getSlotsQuerySchema } from '../validators/slot.validator.js';

const router = Router();

// Public catalog routes
router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProviderById);

// Slots for a specific provider
router.get('/:id/slots', validate(getSlotsQuerySchema), slotController.getSlots);

export default router;
