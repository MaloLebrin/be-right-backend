import { NextFunction, Request, Response } from "express"
import { Role } from "../types/Role"
import Context from "../context"

const checkUserRole = (role: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ctx = Context.get(req)
        if (ctx.user.roles === role) {
            return next()
        } else {
            return res.status(401).send("Not Allowed")
        }

    }
}
export default checkUserRole