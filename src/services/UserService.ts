import { getManager } from "typeorm"
import { ThemeEnum, UserEntity } from "../entity/UserEntity"

export default class UserService {

	public static async getByToken(token: string): Promise<UserEntity> {
		return getManager().findOne(UserEntity, { token })
	}
	public static async updateTheme(id: number, theme: ThemeEnum) {
		const user = await getManager().findOne(UserEntity, id)
		user.theme = theme
		await getManager().save(user)
		return user
	}
}