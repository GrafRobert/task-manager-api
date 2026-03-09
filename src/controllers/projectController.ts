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


