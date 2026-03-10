import express from 'express'
import { createProject, getProjects , getProjectMembers, addMemberToProject} from '../controllers/projectController.js'
import taskRoutes from './taskRoutes.js' 
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protectRoute)


router.post('/', createProject)
router.get('/', getProjects)
router.get('/:projectId/members', getProjectMembers)
router.post('/:projectId/members', addMemberToProject)



router.use('/:projectId/tasks', taskRoutes)

export default router