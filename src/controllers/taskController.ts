import { Response, Request } from 'express'
import pool from '../db.js'

export const getProjectTasks = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const result = await pool.query(
            'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
            [projectId]
        );

        res.status(200).json({ tasks: result.rows });
    } catch (error) {
        console.error('Eroare la aducerea task-urilor:', error);
        res.status(500).json({ error: 'A apărut o eroare la încărcarea task-urilor.' });
    }
}


export const createTask = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, description, priority, assigned_to } = req.body;

        const taskPriority = priority || 'MEDIUM';
        const taskAssignedTo = assigned_to || null;

        const result = await pool.query(
            `INSERT INTO tasks (title, description, status, project_id, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
             [title, description, 'TODO', projectId, taskPriority, taskAssignedTo]
        );

        res.status(201).json({ task: result.rows[0] });
    } catch (error) {
        console.error('Eroare la crearea task-ului:', error);
        res.status(500).json({ error: 'A apărut o eroare la salvarea task-ului.' });
    }
}


export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, taskId } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND project_id = $3 RETURNING *',
            [status, taskId, projectId]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Task-ul nu a fost găsit' });
            return;
        }

        res.status(200).json({ task: result.rows[0] });
    } catch (error) {
        console.error('Eroare la actualizarea task-ului:', error);
        res.status(500).json({ error: 'A apărut o eroare la salvarea modificării.' });
    }
}