import type { Request, Response } from 'express'
import { APP_SOURCE } from '../..'
import Context from '../../context'
import type { GroupEntity } from '../../entity/employees/Group.entity'
import { ApiError } from '../../middlewares/ApiError'
import type { GroupCreationPayload } from '../../services/employee/GroupService'
import { GroupService } from '../../services/employee/GroupService'
import { wrapperRequest } from '../../utils'
import { parseQueryIds } from '../../utils/basicHelper'
import { isUserAdmin } from '../../utils/userHelper'

export class GroupController {
  groupService: GroupService

  constructor() {
    this.groupService = new GroupService(APP_SOURCE)
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { group }: { group: GroupCreationPayload } = req.body

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (!group || !currentUser) {
        throw new ApiError(422, 'Parmètres manquants')
      }

      const newGroup = await this.groupService.createOne(group, currentUser.id)

      if (newGroup) {
        return res.status(200).json(newGroup)
      }
      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (id && currentUser.id) {
        const employee = await this.groupService.getOne(id, currentUser.id)

        return res.status(200).json(employee)
      }
      throw new ApiError(422, 'identifiant du groupe manquant')
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string

      if (ids) {
        const groupIds = parseQueryIds(ids)

        const ctx = Context.get(req)
        const currentUser = ctx.user

        if (groupIds?.length > 0 && currentUser.id) {
          const groups = await this.groupService.getMany(groupIds, currentUser.id)

          return res.status(200).json(groups)
        }
      }
      throw new ApiError(422, 'identifiants des destinataires manquants')
    })
  }

  /**
   * @param id user id
   * @returns all groups from userId
   */
  public getManyByUserId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const currentUser = ctx.user

      const userId = currentUser.id
      if (userId) {
        const employees = await this.groupService.getAllForUser(userId)

        return res.status(200).json(employees)
      }

      throw new ApiError(422, 'identifiant de l\'utilisateur manquant')
    })
  }

  /**
   * @param group group: Partial<GroupEntity>
   * @return return group just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { group }: { group: Partial<GroupEntity> } = req.body

      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (id && currentUser.id) {
        const groupUpdated = await this.groupService.updateOne(id, currentUser.id, group)

        return res.status(200).json(groupUpdated)
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const user = ctx.user

      if (id && user?.id) {
        const getGroupe = await this.groupService.getOne(id, user.id)

        if (getGroupe.createdByUserId === user.id || isUserAdmin(user)) {
          await this.groupService.deleteOne(id)

          return res.status(204).json(getGroupe)
        }
        throw new ApiError(401, 'Action non autorisée')
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }
}
