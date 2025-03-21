import type { NextFunction, Request, Response } from 'express'
import uid2 from 'uid2'
import type { DataSource, Repository } from 'typeorm'
import { generateHash, wrapperRequest } from '../utils'
import { UserEntity } from '../entity/UserEntity'
import { ApiError, AuthenticationError, NotFoundError, ValidationError } from '../middlewares/ApiError'
import { CompanyEntity } from '../entity/Company.entity'
import { Role, SubscriptionEnum } from '../types'
import { SubscriptionService } from '../services/SubscriptionService'
import { userResponse } from '../utils/userHelper'
import { MailjetService, SettingService } from '../services'
import type RedisCache from '../RedisCache'
import { REDIS_CACHE } from '..'
import { CreateUserService } from '../services/user'

export default class AuthController {
  private MailjetService: MailjetService
  private companyRepository: Repository<CompanyEntity>
  private userRepository: Repository<UserEntity>
  private SubscriptionService: SubscriptionService
  private CreateUserService: CreateUserService
  private SettingService: SettingService
  private redisCache: RedisCache

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.MailjetService = new MailjetService(DATA_SOURCE)
      this.companyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.userRepository = DATA_SOURCE.getRepository(UserEntity)
      this.SubscriptionService = new SubscriptionService(DATA_SOURCE)
      this.SettingService = new SettingService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
      this.CreateUserService = new CreateUserService(DATA_SOURCE)
    }
  }

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { email }: { email: string } = req.body

      if (!email) {
        throw new ValidationError('Email manquant', { field: 'email' })
      }

      const user = await this.userRepository.findOne({
        where: { email },
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
        throw new NotFoundError('Utilisateur', { email })
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

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { email, twoFactorRecoveryCode, password }: { email: string; twoFactorRecoveryCode: string; password: string } = req.body

      if (!email || !twoFactorRecoveryCode || !password) {
        throw new ValidationError('Token et mot de passe requis', { 
          fields: { email: !email, twoFactorRecoveryCode: !twoFactorRecoveryCode, password: !password } 
        })
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
        throw new AuthenticationError('Vous n\'êtes pas autorizé à effectuer cette action')
      }

      user.password = generateHash(user.salt, password)
      user.twoFactorRecoveryCode = null
      user.twoFactorSecret = null

      await this.userRepository.save(user)
      return res.status(200).json({ message: 'Mot de passe mis à jour', isSuccess: true })
    })
  }

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

      const isUserExist = await this.userRepository.exists({
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

      const newUser = await this.CreateUserService.createOneUser({
        email,
        firstName,
        lastName,
        password,
        role: Role.OWNER,
        subscription: SubscriptionEnum.BASIC,
        companyId: newCompany.id,
      })

      newCompany.users = [newUser]

      const [settings] = await Promise.all([
        this.SettingService.createDefaultOneForUser(newUser.id),
        this.companyRepository.save(newCompany),
      ])

      delete newCompany.users

      return res.status(200).json({
        user: userResponse(newUser),
        company: newCompany,
        settings,
      })
    })
  }

  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user

      if (!user?.token) {
        throw new ApiError(404, 'Utilisateur non trouvé')
      }
      await Promise.all([
        this.redisCache.invalidate(`user-id-${user.id}`),
        this.redisCache.invalidate(`user-token-${user.token}`),
      ])

      return res.status(203).json({ success: true, error: 'Utilisateur déconnecté' })
    })
  }
}
