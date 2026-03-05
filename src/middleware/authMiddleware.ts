import { Request, Response , NextFunction } from "express";
import jwt from 'jsonwebtoken'


export interface AuthRequest extends Request {
    user?: any;
}

export const protectRoute = (req: AuthRequest, res: Response, next: NextFunction): void => {
    
    const authHeader = req.header('Authorization')

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({error: 'Acces interzis. Nu ai furnizat un token valid.'})
        return
    }

    const token = authHeader.split(' ')[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

        req.user = decoded

        next()
    }catch(error){
        res.status(401).json({error:'Token invalid sau expirat.'})
    }


}