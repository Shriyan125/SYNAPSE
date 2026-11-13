import { Router } from 'express';
import { slotController } from '../controllers/slot.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import { createSlotSchema } from '../validators/slot.validator.js';

const router = Router();

// All slot modification routes require provider authorization
router.use(authenticate, authorizeRoles('provider', 'admin'));

router.post('/', validate(createSlotSchema), slotController.createSlot);
router.patch('/:id', slotController.updateSlot);
router.delete('/:id', slotController.deleteSlot);

export default router;
