import { Request, Response } from "express"
import { getManager } from "typeorm"
import EventEntity from "../entity/EventEntity"
import ImageRightConditionEntity from "../entity/ImageRightConditionEntity"

export default class ImageRightConditionController {

	/**
	 * must have event id
	 * @param IRC IRC: Partial<IRCEntity>
	 * @returns return IRC just created
	 */
	public static createOne = async (req: Request, res: Response) => {
		try {
			const { imageRightCondition }: { imageRightCondition: Partial<ImageRightConditionEntity> } = req.body
			const event = await getManager().findOne(EventEntity, imageRightCondition.event)
			const newImageRightCondition = getManager().create(ImageRightConditionEntity, imageRightCondition)
			event.imageRightCondition = [newImageRightCondition]
			await getManager().save([event, newImageRightCondition])
			return res.status(200).json(newImageRightCondition)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param Id number
	 * @returns entity form given id
	 */
	public static getOne = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const imageRightCondition = await getManager().findOne(ImageRightConditionEntity, id)
			return res.status(200).json(imageRightCondition)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param ids Array of ids
	 * @returns each event
	 */
	public static getMany = async (req: Request, res: Response) => {
		try {
			const { ids }: { ids: number[] } = req.body
			const imageRightConditions = await Promise.all(ids.map(id => getManager().findOne(ImageRightConditionEntity, id)))
			return res.status(200).json({ data: imageRightConditions, total: imageRightConditions.length })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param id userId
	 * @returns all event link with user
	 */
	public static getAllForEventById = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const imageRightConditions = await getManager().find(ImageRightConditionEntity, { event: id })
			return res.status(200).json({ data: imageRightConditions, count: imageRightConditions.length })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param imagerightCondition imagerightCondition: Partial<imagerightConditionEntity>
	 * @returns return imagerightCondition just updated
	 */
	public static updateOne = async (req: Request, res: Response) => {
		try {
			const { imageRightCondition }: { imageRightCondition: Partial<ImageRightConditionEntity> } = req.body
			const id = parseInt(req.params.id)
			const imageRightConditionFinded = await getManager().findOne(ImageRightConditionEntity, id)
			const imageRightConditionUpdated = {
				...imageRightConditionFinded,
				...imageRightCondition,
				updatedAt: new Date(),
			}
			await getManager().save(imageRightConditionUpdated)
			return res.status(200).json(imageRightConditionUpdated)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static deleteOne = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const imageRightConditionToDelete = await getManager().findOne(ImageRightConditionEntity, id)
			await getManager().delete(ImageRightConditionEntity, id)
			return res.status(204).json(imageRightConditionToDelete)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}
}