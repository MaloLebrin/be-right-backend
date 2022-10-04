import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'
import type { UserEntity } from '../entity'
import { getfullUsername } from '../utils/userHelper'
import { useEnv } from '../env'
import type AnswerEntity from '../entity/AnswerEntity'
import type EventEntity from '../entity/EventEntity'

export default class MailService {
  public static async getConnection() {
    const { MAIL_ADRESS, MAIL_MDP } = useEnv()

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${MAIL_ADRESS}`,
        pass: `${MAIL_MDP}`,
      },
    })
  }

  public static getResetPasswordTemplate(recipient: UserEntity, twoFactorRecoveryCode: string) {
    const { FRONT_URL } = useEnv()

    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'BeRight',
        link: 'https://mailgen.js/',
        // Optional logo
        // logo: 'https://mailgen.js/img/logo.png'
      },
    })
    const email = {
      body: {
        name: `${getfullUsername(recipient)}`,
        intro: 'Vous recevez ce mail car vous avez demandé à réinitialiser votre mot de passe.',
        action: {
          instructions: 'Clickez sur le bouton ci-dessous pour réinitialiser votre mot de passe.',
          button: {
            color: '#1b1e3dF2',
            text: 'Réinitialiser le mot de passe',
            link: `${FRONT_URL}/reset-password/${twoFactorRecoveryCode}/?email=${recipient.email}`,
          },
        },
      },
    }
    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(email)

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(email)
    return { emailBody, emailText }
  }

  public static getSendImageRightTemplate({ recipient, event, answer }: { recipient: UserEntity; answer: AnswerEntity; event: EventEntity }) {
    if (!recipient || !event || !answer) {
      throw new Error('manque parametre pour envoyer l\'email')
    }

    const { FRONT_URL } = useEnv()
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'BeRight',
        link: 'https://mailgen.js/',
        // Optional logo
        // logo: 'https://mailgen.js/img/logo.png'
      },
    })

    const email = {
      body: {
        name: `${getfullUsername(recipient)}`,
        intro: 'Vous recevez ce mail car vous avez une demande d\'utilisation de votre image à remplur.',
        action: {
          instructions: 'Clickez sur le bouton ci-dessous pour voir le document.',
          button: {
            color: '#1b1e3dF2',
            text: 'Voir le document',
            link: `${FRONT_URL}/answer/${answer.id}`,
          },
        },
      },
    }
    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(email)

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(email)
    return { emailBody, emailText }
  }
}
