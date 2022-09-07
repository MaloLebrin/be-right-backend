import type { Request, Response } from 'express'
import { getManager } from 'typeorm'
import uid2 from 'uid2'
import { generateHash } from '../utils'
import { UserEntity } from '../entity'
import MailService from '../services/MailService'

export default class AuthController {
  public static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email }: { email: string } = req.body
      const user = await getManager().findOne(UserEntity, { email })
      if (!user) {
        return res.status(422).json({ error: 'Email inconnu', isSuccess: false })
      }

      const twoFactorSecret = uid2(128)
      const twoFactorRecoveryCode = generateHash(twoFactorSecret, email)
      user.twoFactorSecret = twoFactorSecret
      user.twoFactorRecoveryCode = twoFactorRecoveryCode
      const transporter = await MailService.getConnection()
      const { emailBody, emailText } = MailService.getResetPasswordTemplate(user, twoFactorRecoveryCode)
      transporter.sendMail({
        from: `${process.env.MAIL_ADRESS}`,
        to: email,
        subject: 'Récupération de mot de passe Be-Right',
        html: emailBody,
        text: emailText,
      }, err => {
        if (err)
          return console.error(err)
        console.error('Message sent successfully.')
      })

      await getManager().save(user)
      return res.status(200).json({ message: 'Email envoyé', isSuccess: true })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, twoFactorRecoveryCode, password }: { email: string; twoFactorRecoveryCode: string; password: string } = req.body

      const user = await getManager().findOne(UserEntity, { email })
      if (!user) {
        return res.status(422).json({ error: 'Email inconnu', isSuccess: false })
      }
      if (user.twoFactorRecoveryCode !== twoFactorRecoveryCode || email !== user.email) {
        return res.status(422).json({ error: 'Vous n\'êtes pas autorizé à effectuer cette action', isSuccess: false })
      }
      user.password = generateHash(user.salt, password)
      user.twoFactorRecoveryCode = null
      user.twoFactorSecret = null
      await getManager().save(user)
      return res.status(200).json({ message: 'Mot de passe mis à jour', isSuccess: true })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }
}
