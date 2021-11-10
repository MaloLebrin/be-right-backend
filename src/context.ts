import { Request } from 'express'
import { UserEntity } from './entity/UserEntity'

export default class Context {
    static bindings = new WeakMap<Request, Context>()

    public user = {} as UserEntity
    static bind (req: Request): void {
        const ctx = new Context()
        Context.bindings.set(req, ctx)
    }

    static get (req: Request) :Context | null {
        return Context.bindings.get(req) || null
    }
}