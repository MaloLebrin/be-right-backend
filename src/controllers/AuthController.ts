import type { Request, Response } from 'express'
import uid2 from 'uid2'
import type { Logger } from 'pino'
import type { EntityManager } from 'typeorm'
import { generateHash, wrapperRequest } from '../utils'
import MailService from '../services/MailService'
import { logger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { APP_SOURCE } from '..'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'

export default class AuthController {
  logger: Logger<{
    transport: {
      target: string
      options: {
        colorize: boolean
      }
    }
  }>

  getManager: EntityManager
  MailService: MailService

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.MailService = new MailService()
    this.logger = logger
  }

  public forgotPassword = async (req: Request, res: Response) => {
    const { MAIL_ADRESS } = useEnv()

    await wrapperRequest(req, res, async () => {
      const { email }: { email: string } = req.body
      const user = await this.getManager.findOneBy(UserEntity, { email })

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email').Handler(res)
      }

      const twoFactorSecret = uid2(128)
      const twoFactorRecoveryCode = generateHash(twoFactorSecret, email)
      user.twoFactorSecret = twoFactorSecret
      user.twoFactorRecoveryCode = twoFactorRecoveryCode

      const transporter = await this.MailService.getConnection()
      const { emailBody, emailText } = this.MailService.getResetPasswordTemplate(user, twoFactorRecoveryCode)

      transporter.sendMail({
        from: `${MAIL_ADRESS}`,
        to: email,
        subject: 'Récupération de mot de passe Be-Right',
        html: emailBody,
        text: emailText,
      }, err => {
        if (err) {
          this.logger.debug(err)
          return console.error(err)
        }

        this.logger.info('Message sent successfully.')
      })

      await this.getManager.save(user)
      return res.status(200).json({ message: 'Email envoyé', isSuccess: true })
    })
  }

  public resetPassword = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, twoFactorRecoveryCode, password }: { email: string; twoFactorRecoveryCode: string; password: string } = req.body

      const user = await this.getManager.findOneBy(UserEntity, { email })

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email').Handler(res)
      }

      if (user.twoFactorRecoveryCode !== twoFactorRecoveryCode || email !== user.email) {
        throw new ApiError(401, 'Vous n\'êtes pas autorizé à effectuer cette action').Handler(res)
      }

      user.password = generateHash(user.salt, password)
      user.twoFactorRecoveryCode = null
      user.twoFactorSecret = null

      await this.getManager.save(user)
      return res.status(200).json({ message: 'Mot de passe mis à jour', isSuccess: true })
    })
  }
}
