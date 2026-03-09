import express from 'express'
import { createTask, getProjectTasks, updateTaskStatus } from '../controllers/taskController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router({ mergeParams: true})

router.use(protectRoute)

router.get('/', getProjectTasks)
router.post('/', createTask)
router.patch('/:taskId', updateTaskStatus)

export default router