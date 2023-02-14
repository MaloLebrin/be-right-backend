import type { Client } from 'node-mailjet'
import Mailjet from 'node-mailjet'
import type { DataSource, Repository } from 'typeorm'
import type AnswerEntity from '../entity/AnswerEntity'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import { MailEntity } from '../entity/MailEntity'
import { useEnv } from '../env'
import { ApiError } from '../middlewares/ApiError'

interface FromMailObj {
  Email: string
  Name: string
}

interface SendMailPayload {
  employee: EmployeeEntity
  answer: AnswerEntity
}

export class MailjetService {
  SecretKey: string
  PublicKey: string
  mailJetClient: Client
  FromObj: FromMailObj
  repository: Repository<MailEntity>

  constructor(APP_SOURCE: DataSource) {
    const {
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE,
      ADMIN_EMAIL,
      ADMIN_FIRTNAME,
      ADMIN_LASTNAME,
    } = useEnv()

    this.PublicKey = MJ_APIKEY_PUBLIC
    this.SecretKey = MJ_APIKEY_PRIVATE
    this.mailJetClient = this.connection()
    this.FromObj = {
      Email: ADMIN_EMAIL,
      Name: `${ADMIN_FIRTNAME} ${ADMIN_LASTNAME}`,
    }

    this.repository = APP_SOURCE.getRepository(MailEntity)
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
    return payload.map(({ employee }) => ({
      From: this.FromObj,
      To: [
        {
          Email: employee.email,
          Name: this.getFullName(employee),
        },
      ],
      Subject: 'Vous avez un document à signer',
      TextPart: `Cher ${this.getFullName(employee)}, vous avez un document à signer!`,
      HTMLPart: '<h3>Cher Malo Lebrin,</h3><br />Vous avez un document à signer',
    }))
  }

  public createMailEntity = async ({ answer, messageHref, messageId, messageUuid }: { answer: AnswerEntity; messageHref: string; messageId: string; messageUuid: string }) => {
    const mailEntity = this.repository.create({
      answer,
      messageHref,
      messageId,
      messageUuid,
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
        const t = body as any
        const pathToMessage = t.Messages[0].To[0]
        await this.createMailEntity({
          answer: payload.answer,
          messageHref: pathToMessage.MessageHref,
          messageId: pathToMessage.MessageUUID,
          messageUuid: pathToMessage.MessageID,
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
