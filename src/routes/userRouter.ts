import express from 'express'
import { registerUser, loginUser, getUserProfile, updateUserRole } from '../controllers/userController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/profile', protectRoute, getUserProfile)

router.put('/role', protectRoute, updateUserRole)

export default router;
