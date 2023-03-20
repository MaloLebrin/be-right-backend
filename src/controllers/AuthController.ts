import type { Request, Response } from 'express'
import uid2 from 'uid2'
import type { Logger } from 'pino'
import type { Repository } from 'typeorm'
import { generateHash, userResponse, wrapperRequest } from '../utils'
import MailService from '../services/MailService'
import { logger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { APP_SOURCE } from '..'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import { CompanyEntity } from '../entity/Company.entity'
import { Role, SubscriptionEnum } from '../types'
import { SubscriptionService } from '../services/SubscriptionService'
import UserService from '../services/UserService'

export default class AuthController {
  logger: Logger<{
    transport: {
      target: string
      options: {
        colorize: boolean
      }
    }
  }>

  MailService: MailService
  companyRepository: Repository<CompanyEntity>
  userRepository: Repository<UserEntity>
  SubscriptionService: SubscriptionService
  UserService: UserService

  constructor() {
    this.MailService = new MailService()
    this.logger = logger
    this.companyRepository = APP_SOURCE.getRepository(CompanyEntity)
    this.userRepository = APP_SOURCE.getRepository(UserEntity)
    this.SubscriptionService = new SubscriptionService(APP_SOURCE)
    this.UserService = new UserService(APP_SOURCE)
  }

  private getUserByMail(email: string) {
    return this.userRepository.findOneBy({ email })
  }

  public forgotPassword = async (req: Request, res: Response) => {
    const { MAIL_ADRESS } = useEnv()

    await wrapperRequest(req, res, async () => {
      const { email }: { email: string } = req.body
      const user = await this.getUserByMail(email)

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email')
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

      await this.userRepository.save(user)
      return res.status(200).json({ message: 'Email envoyé', isSuccess: true })
    })
  }

  public resetPassword = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, twoFactorRecoveryCode, password }: { email: string; twoFactorRecoveryCode: string; password: string } = req.body

      const user = await this.getUserByMail(email)

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email')
      }

      if (user.twoFactorRecoveryCode !== twoFactorRecoveryCode || email !== user.email) {
        throw new ApiError(401, 'Vous n\'êtes pas autorizé à effectuer cette action')
      }

      user.password = generateHash(user.salt, password)
      user.twoFactorRecoveryCode = null
      user.twoFactorSecret = null

      await this.userRepository.save(user)
      return res.status(200).json({ message: 'Mot de passe mis à jour', isSuccess: true })
    })
  }

  public signUp = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const {
        email,
        firstName,
        lastName,
        password,
        companyName,
      }:
      {
        email: string
        firstName: string
        lastName: string
        password: string
        companyName: string
      } = req.body

      if (!email || !firstName || !lastName || !password || !companyName) {
        throw new ApiError(422, 'Imformations manquantes')
      }

      const isUserExist = await this.userRepository.exist({
        where: {
          email,
        },
      })

      if (isUserExist) {
        throw new ApiError(423, 'Un compte existe déjà avec cette addresse email')
      }

      const subscription = await this.SubscriptionService.createBasicSubscription()

      const newCompany = this.companyRepository.create({
        name: companyName,
        subscription,
        subscriptionLabel: subscription.type,
      })
      await this.companyRepository.save(newCompany)

      const newUser = await this.UserService.createOneUser({
        email,
        firstName,
        lastName,
        password,
        role: Role.OWNER,
        subscription: SubscriptionEnum.BASIC,
        companyId: newCompany.id,
      })

      newCompany.owners = [newUser]
      newCompany.users = [newUser]

      await this.companyRepository.save(newCompany)

      return res.status(200).json(userResponse(newUser))
    })
  }
}
