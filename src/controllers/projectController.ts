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
        const selectQuery = `
    SELECT p.*, pm.role 
    FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = $1
    ORDER BY p.created_at DESC;
    `;
        const result = await pool.query(selectQuery, [userId])

        res.status(200).json({
            projects: result.rows
        })
    }catch(error){
        console.error('Eroare la obținerea proiectelor:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}

export const getProjectMembers = async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params

    try{
        const selectQuery = `
            SELECT u.id, u.name, u.email, pm.role
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = $1
            ORDER BY pm.added_at ASC;
        `;
        const result = await pool.query(selectQuery, [projectId])

        res.status(200).json({members: result.rows})
    }catch(error){
        console.error('Eroare la obținerea membrilor:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}

export const addMemberToProject = async (req: AuthRequest, res: Response): Promise<void> => {
    const {projectId} = req.params
    const { email } = req.body

    try{
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1',[email])

        if(userResult.rowCount === 0){
            res.status(404).json({error: 'Nu a fost găsit niciun utilizator cu acest email.'})
            return
        }

        const newUserId = userResult.rows[0].id

        const insertQuery = `
            INSERT INTO project_members (project_id, user_id, role)
            VALUES ($1, $2, 'MEMBER')
            RETURNING *;
        
        `;
        await pool.query(insertQuery,[projectId, newUserId])

        res.status(201).json({message: 'Membu adaugat cu succes!'})

    }catch(error: any){
        if (error.code === '23505') {
             res.status(400).json({ error: 'Acest utilizator este deja membru al proiectului.' });
             return;
        }
        console.error('Eroare la adăugarea membrului:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}


