import express from 'express'
import { createTask, getProjectTasks, updateTaskStatus , deleteTask } from '../controllers/taskController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router({ mergeParams: true})

router.use(protectRoute)

router.get('/', getProjectTasks)
router.post('/', createTask)
router.patch('/:taskId', updateTaskStatus)
router.delete('/:taskId', deleteTask)

export default router