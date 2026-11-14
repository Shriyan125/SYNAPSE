import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { uploadAvatarMiddleware } from '../middleware/upload.js';
import { updateMeSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.post('/me/avatar', uploadAvatarMiddleware, userController.uploadAvatar);
router.post('/avatar', uploadAvatarMiddleware, userController.uploadAvatar);

export default router;
