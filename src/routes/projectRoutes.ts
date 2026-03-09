import express from 'express'
import { createProject, getProjects ,getProjectTasks , createTask , updateTaskStatus} from '../controllers/projectController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protectRoute)

router.post('/', createProject)

router.get('/', getProjects)

router.get('/:projectId/tasks',getProjectTasks)

router.post('/:projectId/tasks', createTask)

router.patch('/:projectId/tasks/:taskId', updateTaskStatus)

export default router