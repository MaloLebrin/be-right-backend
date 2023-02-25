import type { Client } from 'node-mailjet'
import Mailjet from 'node-mailjet'
import type { DataSource, Repository } from 'typeorm'
import AnswerEntity from '../entity/AnswerEntity'
import { MailEntity } from '../entity/MailEntity'
import { useEnv } from '../env'
import { ApiError } from '../middlewares/ApiError'
import type { FromMailObj, MailjetResponse, SendMailPayload } from '../types'

export class MailjetService {
  SecretKey: string
  PublicKey: string
  mailJetClient: Client
  FromObj: FromMailObj
  repository: Repository<MailEntity>
  answerRepository: Repository<AnswerEntity>

  constructor(APP_SOURCE: DataSource) {
    const {
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE,
      ADMIN_EMAIL,
      ADMIN_FIRTNAME,
      ADMIN_LASTNAME,
      IS_FEATURE_MAIL_ENABLED,
    } = useEnv()

    if (IS_FEATURE_MAIL_ENABLED) {
      this.PublicKey = MJ_APIKEY_PUBLIC
      this.SecretKey = MJ_APIKEY_PRIVATE
      this.mailJetClient = this.connection()
      this.FromObj = {
        Email: ADMIN_EMAIL,
        Name: `${ADMIN_FIRTNAME} ${ADMIN_LASTNAME}`,
      }

      this.repository = APP_SOURCE.getRepository(MailEntity)
      this.answerRepository = APP_SOURCE.getRepository(AnswerEntity)
    } else {
      throw new ApiError(422, 'L\'envoie d\'email n\'est pas disponible')
    }
  }

  private connection = () => {
    if (!this.PublicKey || !this.SecretKey) {
      throw new ApiError(400, 'missing secrets variables')
    }
    return Mailjet.apiConnect(this.PublicKey, this.SecretKey)
  }

  private getFullName<T extends { firstName: string; lastName: string }>(recipient: T) {
    return `${recipient.firstName} ${recipient.lastName}`
  }

  private buildMailsCreationAnswer = (payload: SendMailPayload[]) => {
    return payload.map(({ employee, template }) => ({
      From: this.FromObj,
      To: [
        {
          Email: 'malolebrin@icloud.com',
          // Email: employee.email,
          Name: this.getFullName(employee),
        },
      ],
      Subject: 'Vous avez un document à signer',
      // TemplateID: 4583388,
      // TemplateLanguage: true,
      TextPart: `Cher ${this.getFullName(employee)}, vous avez un document à signer!`,
      HTMLPart: template || '<h3>Cher Malo Lebrin,</h3><br />Vous avez un document à signer',
      data: { prénom: employee.firstName },
    }))
  }

  public createMailEntity = async ({
    answer,
    messageHref,
    messageId,
    messageUuid,
  }: {
    answer: AnswerEntity
    messageHref: string
    messageId: string
    messageUuid: string
  }) => {
    const mailEntity = this.repository.create({
      answer,
      messageHref,
      messageId,
      messageUuid,
    })

    await this.answerRepository.update({ id: answer.id }, {
      mailSendAt: new Date(),
    })
    await this.repository.save(mailEntity)
    return mailEntity
  }

  public deleteMany = async (ids: number[]) => {
    await this.repository.softDelete(ids)
  }

  public sendEmployeeMail = async (payload: SendMailPayload) => {
    try {
      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: this.buildMailsCreationAnswer([payload]),
        })

      if (response.status === 200) {
        const t = body as unknown as MailjetResponse
        const pathToMessage = t.Messages[0].To[0]
        await this.createMailEntity({
          answer: payload.answer,
          messageHref: pathToMessage.MessageHref,
          messageUuid: pathToMessage.MessageUUID,
          messageId: pathToMessage.MessageID,
        })
      }

      return {
        status: response.status,
        message: response.statusText,
        body,
      }
    } catch (error) {
      console.error(error, '<==== error')
    }
  }
}
