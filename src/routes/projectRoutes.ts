import express from 'express'
import { createProject, getProjects } from '../controllers/projectController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protectRoute)

router.post('/', createProject)

router.get('/', getProjects)

export default router