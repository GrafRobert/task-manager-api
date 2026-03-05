import { Response } from "express";
import pool from '../db.js'
import { AuthRequest } from "../middleware/authMiddleware.js";
import { promises } from "dns";

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {

    const {title, description, project_id, assigned_to, status, priority} = req.body

    try {
        const insertQuery = `
            INSERT INTO tasks (title,description,project_id,assigned_to,status,priority)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *;
        
        `;

        const values = [
            title,
            description,
            project_id,
            assigned_to || null,
            status || 'TODO',
            priority || 'MEDIUM'

        ];

        const result = await pool.query(insertQuery,values)

        res.status(201).json({
            message: 'Task creat cu succes!',
            task: result.rows[0]
        })
    }catch(error) {
        console.error('Eroare la crearea task-ului:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }


}


export const getTaskByProject = async (req: AuthRequest, res: Response): Promise<void> => {

    const projectId = req.params.projectId

    try{
        const selectQuery = `
            SELECT * FROM tasks
            WHERE project_id = $1
            ORDER BY created_at DESC;
        
        `;
        const result = await pool.query(selectQuery,[projectId])

        res.status(200).json({
            tasks: result.rows
        })
    }catch (error) {
        console.error('Eroare la obținerea task-urilor:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}
