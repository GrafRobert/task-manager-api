import { Response , Request,} from 'express'
import pool from '../db.js'
import { AuthRequest } from '../middleware/authMiddleware.js'



export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    const {name, description} = req.body

    const userId = req.user.userId

    try{
        const insertQuery = `
            INSERT INTO projects (name, description, user_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        
        `;

        const values = [name, description, userId]
        const result = await pool.query(insertQuery, values)

        res.status(201).json({
            message: 'proiect creat cu succes!',
            project: result.rows[0]
        })

    }catch (error){
        console.error('Eroare la crearea proiectului:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }

}


export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user.userId

    try{
        const selectQuery = `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC;`
        const result = await pool.query(selectQuery, [userId])

        res.status(200).json({
            projects: result.rows
        })
    }catch(error){
        console.error('Eroare la obținerea proiectelor:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}


export const getProjectTasks = async (req: Request, res: Response) => {

    try{
        const {projectId} = req.params

        const result = await pool.query(
            'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
            [projectId]
        )

        res.status(200).json({tasks: result.rows})
    }catch(error){
        console.error('Eroare la aducerea task-urilor:', error);
    res.status(500).json({ error: 'A apărut o eroare la încărcarea task-urilor.' });
    }
}

export const createTask = async (req: Request, res: Response) => {

    try{
        const {projectId} = req.params

        const {title, description} = req.body


        const result = await pool.query(
            `INSERT INTO tasks (title,description,status,project_id)
             VALUES ($1,$2,$3,$4) RETURNING *`,
             [title,description,'TODO',projectId]
        )

        res.status(201).json({ task: result.rows[0]})
    }catch(error) {
        console.error('Eroare la crearea task-ului:', error);
    res.status(500).json({ error: 'A apărut o eroare la salvarea task-ului.' });
    }

}

export const updateTaskStatus = async (req: Request, res: Response) => {

    try{
        const { projectId, taskId} = req.params
        const { status } = req.body

        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND project_id = $3 RETURNING *',
      [status, taskId, projectId]
        )

        if(result.rowCount === 0) {
            return res.status(404).json({error: 'Task-ul nu a fost gasit'})
        }

        res.status(200).json({ task: result.rows[0]})
    }catch(error){
        console.error('Eroare la actualizarea task-ului:', error);
    res.status(500).json({ error: 'A apărut o eroare la salvarea modificării.' });
    }

} 