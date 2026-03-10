import { Response, Request } from 'express'
import pool from '../db.js'
import { REPLCommand } from 'repl';

export const getProjectTasks = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const selectQuery = `
            SELECT t.*, u.name AS assigned_to
            FROM tasks t
            LEFT JOIN task_assignees ta ON t.id = ta.task_id
            LEFT JOIN users u ON ta.user_id = u.id
            WHERE t.project_id = $1
            ORDER BY t.created_at DESC
        `;

        const result = await pool.query(selectQuery, [projectId]);

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

        const taskResult = await pool.query(
            `INSERT INTO tasks (title, description, status, project_id, priority)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
             [title, description, 'TODO', projectId, taskPriority]
        );

        const newTask = taskResult.rows[0];

        if (assigned_to) {
            await pool.query(
                `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)`,
                [newTask.id, assigned_to]
            );
        }

        res.status(201).json({ task: newTask });
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


export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try{
        const { projectId, taskId} = req.params

        const deleteQuery = `
            DELETE FROM tasks
            WHERE id = $1 AND project_id = $2
            RETURNING *;
        
        `;

        const result = await pool.query(deleteQuery, [taskId, projectId])

        if(result.rowCount === 0){
            res.status(404).json({ error: 'Task-ul nu a fost gasit sau a fost deja sters!'})
            return
        }

        res.status(200).json({ message: 'Task sters cu succes!'})
    }catch(error){
        console.error('Eroare la ștergerea task-ului:', error);
        res.status(500).json({ error: 'A apărut o eroare la ștergerea task-ului.' });
    }
}