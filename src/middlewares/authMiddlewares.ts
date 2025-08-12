import { secretKey } from '../app.js'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export function authenticateToken (req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.token

  if (token === undefined) {
    res.status(401).json({ message: 'Token no proporcionado' })
  }

  jwt.verify(token, secretKey, (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
    if (err != null) return res.status(403).json({ message: 'Token invalido' })

    req.body.user = payload // {role , userId}

    next()
  })
}

export function authorizeRole(role: string): Function {
  return (req: Request, res: Response, next: NextFunction): void => {
    if(req.body.user.role !== role) {
      res.status(403).json({message: 'No tienes permisos para acceder a este recurso'})
    }
    next()
  }
  
}


