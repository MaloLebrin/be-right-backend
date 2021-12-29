import { Request } from 'express'
import { SHA256 } from "crypto-js"
import encBase64 from "crypto-js/enc-base64"
import { Like } from 'typeorm'

/**
 * create hash password
 * @param salt string
 * @param password string recieved by front
 * @returns hash saved in DB
 */
export const generateHash = (salt: string, password: string) => {
    const hash = SHA256(password + salt).toString(encBase64)
    return hash
}

/**
 * @param entity any entity in APP
 * @returns entity filtered without any confidential fields
 */
export const userResponse = (entity: Record<string, any>) => {
    const entityReturned = {} as Record<string, any>
    for (const [key, value] of Object.entries(entity)) {
        if (key !== 'password' && key !== 'salt') {
            entityReturned[key] = value
        }
    }
    return entityReturned
}

/**
 * function to manage pagination filters query must be write like this filters[field]=value
 * @param req to find queries
 * @returns queries then pass them to find() entity
 */
export const paginator = (req: Request, searchableField: string[]) => {
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1
    const limit = req.query.limit ? Math.abs(parseInt(req.query.limit.toString())) : 5
    const search = req.query.search ? Like(`%${req.query.search}%`) : null

    const queries = {
        page,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: req.query.orderBy ? req.query.orderBy : 'id',
        orderDir: req.query.orderDir ? req.query.orderDir : 'desc',
        where: req.query.filters ? req.query.filters : search && searchableField.length ? generateWhereFieldsByEntity(searchableField, req) : null,
    }
    return queries
}

/**
 * function to build where params for searchable request. Build for searchable inputs
 * @param searchableFields form an entity must be strings[]
 * @param req req to find query and search value
 * @returns filters build with searchable fields form entity as key, and search value  
 */
export const generateWhereFieldsByEntity = (searchableFields: string[], req: Request) => {
    const search = req.query.search ? Like(`%${req.query.search}%`) : null
    const filters = searchableFields.map(field => {
        return {
            [field]: search,
        }
    })
    return filters
}

export function toCent(value: number) {
    return value * 100
}