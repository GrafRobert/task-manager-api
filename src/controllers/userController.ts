import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import pool from '../db.js'
import jwt from 'jsonwebtoken'
import { AuthRequest } from "../middleware/authMiddleware.js";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const {name, email, password, role} = req.body

    try{
        const saltRouns = 10;
        const hashedPassword = await bcrypt.hash(password, saltRouns)

        const insertQuery = `
        
        INSERT INTO users (name,email,password, role)
        VALUES($1,$2,$3,$4)
        RETURNING id, name, email, role, created_at;
        `;

        const values = [name, email, hashedPassword, role || 'NEALOCAT']
        const result = await pool.query(insertQuery, values)
        res.status(201).json({
            message: 'Utilizator creat cu succes!',
            user: result.rows[0]
        })
    }catch (error: any) {
        console.error('Eroare la crearea utilizatorului:', error);

        if(error.code === '23505'){
            res.status(400).json({ error: 'Acest email este deja folosit.' });
        }else {
            res.status(500).json({ error: 'Eroare internă a serverului.' });
        }
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    try{
        const userQuery = `SELECT * FROM users WHERE email= $1;`
        const result = await pool.query(userQuery, [email])


        if(result.rows.length === 0){
            res.status(401).json({ error: 'Email sau parola incorecta!'})
            return
        }

        const user = result.rows[0]

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid) {
            res.status(401).json({ error: 'Email sau parolă incorectă.' });
            return;
        }

        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET as string,
            {expiresIn: '1d'}
        )

        res.status(200).json({
            message: 'Logare reusita!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }catch (error){
        console.error('Eroare la logare:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}


export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {

    try{
    const userId = req.user.userId

    const query = `SELECT id,name,email,role,created_at FROM users WHERE id = $1`
    const result = await pool.query(query, [userId])

    if(result.rows.length === 0) {
        res.status(404).json({ error: 'Utilizatorul nu a fost gasit.' })
        return
    }

    res.status(200).json({
        message: 'Ai accesat o ruta protejata',
        user: result.rows[0]
    })
    }catch (error) {
        console.error('Eroare la obținerea profilului:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try{

        const userId= req.user.userId
        const {role} = req.body

        if(!role){
            res.status(400).json({ error: 'Te rugăm să selectezi un rol.' });
            return;
        }

        const updateQuery = `
            UPDATE users
            SET role = $1
            WHERE id = $2
            RETURNING id,name,email,role
        
        `;
        const result = await pool.query(updateQuery, [role, userId])

        res.status(200).json({
            message: 'Rolul a fost actualizat cu succes!',
            user: result.rows[0]
        })
    }catch(error){
        console.error('Eroare la actualizarea rolului:', error);
        res.status(500).json({ error: 'Eroare internă a serverului.' });
    }
}