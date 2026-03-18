import { Response, Request } from 'express'
import pool from '../db.js'


export const getProjectTasks = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        
        const selectQuery = `
            SELECT t.*, 
                   ta.user_id AS assigned_to,
                   COALESCE(NULLIF(u.name, ''), u.email) AS assignee_name
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

        
        console.log("---- CREARE TASK NOU ----");
        console.log("Date primite de la frontend:", { title, priority, assigned_to });

        const taskPriority = priority || 'MEDIUM';

       
        const taskResult = await pool.query(
            `INSERT INTO tasks (title, description, status, project_id, priority)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
             [title, description, 'TODO', projectId, taskPriority]
        );

        const newTask = taskResult.rows[0];

       
        if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') {
            console.log(`Băgăm în task_assignees: TaskID=${newTask.id}, UserID=${assigned_to}`);
            
            await pool.query(
                `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)`,
                [newTask.id, assigned_to]
            );
            console.log("Asignare salvată cu succes în baza de date!");
        } else {
            console.log("Task-ul a fost creat FĂRĂ a fi asignat cuiva (assigned_to e gol).");
        }

        res.status(201).json({ task: newTask });
    } catch (error) {
       
        console.error('Eroare CRITICĂ la crearea task-ului:', error);
        res.status(500).json({ error: 'A apărut o eroare la salvarea task-ului.' });
    }
}


export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, taskId } = req.params;
        
     
        const { title, description, status, priority, assigned_to } = req.body;

        
        const vechiResult = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
            [taskId, projectId]
        );

        if (vechiResult.rowCount === 0) {
            res.status(404).json({ error: 'Task-ul nu a fost găsit' });
            return;
        }

        const vechi = vechiResult.rows[0];

       
        const noulTitle = title !== undefined ? title : vechi.title;
        const nouaDescription = description !== undefined ? description : vechi.description;
        const noulStatus = status !== undefined ? status : vechi.status;
        const nouaPriority = priority !== undefined ? priority : vechi.priority;

       
        const updateResult = await pool.query(
            `UPDATE tasks 
             SET title = $1, description = $2, status = $3, priority = $4 
             WHERE id = $5 AND project_id = $6 
             RETURNING *`,
            [noulTitle, nouaDescription, noulStatus, nouaPriority, taskId, projectId]
        );

       
        if (assigned_to !== undefined) {
            
            await pool.query('DELETE FROM task_assignees WHERE task_id = $1', [taskId]);

            
            if (assigned_to !== null && assigned_to !== '') {
                await pool.query(
                    'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)',
                    [taskId, assigned_to]
                );
            }
        }

       
        res.status(200).json({ task: updateResult.rows[0] });
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