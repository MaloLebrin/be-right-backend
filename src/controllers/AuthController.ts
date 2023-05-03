import type { Request, Response } from 'express'
import uid2 from 'uid2'
import type { Logger } from 'pino'
import type { Repository } from 'typeorm'
import { generateHash, wrapperRequest } from '../utils'
import { logger } from '../middlewares/loggerService'
import { APP_SOURCE } from '..'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import { CompanyEntity } from '../entity/Company.entity'
import { Role, SubscriptionEnum } from '../types'
import { SubscriptionService } from '../services/SubscriptionService'
import UserService from '../services/UserService'
import { userResponse } from '../utils/userHelper'
import { MailjetService } from '../services'

export default class AuthController {
  logger: Logger<{
    transport: {
      target: string
      options: {
        colorize: boolean
      }
    }
  }>

  MailjetService: MailjetService
  companyRepository: Repository<CompanyEntity>
  userRepository: Repository<UserEntity>
  SubscriptionService: SubscriptionService
  UserService: UserService

  constructor() {
    this.MailjetService = new MailjetService(APP_SOURCE)
    this.logger = logger
    this.companyRepository = APP_SOURCE.getRepository(CompanyEntity)
    this.userRepository = APP_SOURCE.getRepository(UserEntity)
    this.SubscriptionService = new SubscriptionService(APP_SOURCE)
    this.UserService = new UserService(APP_SOURCE)
  }

  public forgotPassword = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email }: { email: string } = req.body

      if (!email) {
        throw new ApiError(422, 'Email manquant')
      }

      const user = await this.userRepository.findOne({
        where: {
          email,
        },
        select: {
          id: true,
          twoFactorSecret: true,
          twoFactorRecoveryCode: true,
          email: true,
          firstName: true,
          lastName: true,
          token: true,
        },
      })

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email')
      }

      const twoFactorSecret = uid2(128)
      const twoFactorRecoveryCode = generateHash(twoFactorSecret, email)
      user.twoFactorSecret = twoFactorSecret
      user.twoFactorRecoveryCode = twoFactorRecoveryCode

      await this.MailjetService.sendRecoveryPasswordEmail({ user })

      await this.userRepository.save(user)
      return res.status(200).json({ message: 'Email envoyé', isSuccess: true })
    })
  }

  public resetPassword = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, twoFactorRecoveryCode, password }: { email: string; twoFactorRecoveryCode: string; password: string } = req.body

      if (!email || !twoFactorRecoveryCode || !password) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      const user = await this.userRepository.findOne({
        where: {
          email,
        },
        select: {
          id: true,
          twoFactorSecret: true,
          twoFactorRecoveryCode: true,
          email: true,
          firstName: true,
          lastName: true,
          token: true,
          salt: true,
        },
      })

      if (!user) {
        throw new ApiError(422, 'Aucun utilisateur trouvé avec cet email')
      }

      const hash = generateHash(user.twoFactorSecret, email)

      if (user.twoFactorRecoveryCode !== hash || email !== user.email) {
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

      newCompany.users = [newUser]

      await this.companyRepository.save(newCompany)

      delete newCompany.users

      return res.status(200).json({
        user: userResponse(newUser),
        company: newCompany,
      })
    })
  }
}
