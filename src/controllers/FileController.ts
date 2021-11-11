import { Request, Response } from "express"

export default class FileController {

	public static newFile = async (req: Request, res: Response) => {
		try {

		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}
}