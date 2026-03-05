import express from 'express'
import { createTask, getTaskByProject } from '../controllers/taskController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protectRoute)

router.post('/',createTask)

router.get('/project/:projectId',getTaskByProject)

export default router