import type { Client } from 'node-mailjet'
import Mailjet from 'node-mailjet'
import type { DataSource, Repository } from 'typeorm'
import AnswerEntity from '../entity/AnswerEntity'
import { MailEntity } from '../entity/MailEntity'
import { useEnv } from '../env'
import { ApiError } from '../middlewares/ApiError'
import { logger } from '../middlewares/loggerService'
import type { FromMailObj, MailjetResponse, SendMailPayload } from '../types'
import type { UserEntity } from '../entity/UserEntity'
import type EventEntity from '../entity/EventEntity'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { isProduction } from '../utils/envHelper'
import { MailjetTemplateId } from '../utils/mailJetHelpers'
import type { CompanyEntity } from '../entity/Company.entity'

export class MailjetService {
  SecretKey: string
  PublicKey: string
  mailJetClient: Client | undefined
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
      logger.warn('Send email feature in not enabled')
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
    return payload.map(({ employee, creator, event, answer }) => ({
      From: this.FromObj,
      To: [
        {
          Email: employee.email,
          Name: this.getFullName(employee),
        },
      ],
      Subject: 'Vous avez un document à signer',
      TemplateLanguage: true,
      TemplateID: MailjetTemplateId.EVENT_CREATED,
      TextPart: `Cher ${this.getFullName(employee)}, vous avez un document à signer!`,
      Variables: {
        recipientFirstName: employee.firstName,
        recipientLastName: employee.lastName,
        recipientEmail: employee.email,
        eventName: event.name,
        eventDescription: event.description,
        creator: this.getFullName(creator),
        link: `${isProduction() ? process.env.FRONT_URL : 'http://localhost:3000'}/answer/check-${answer.id}?email=${employee.email}&token=${answer.token}`,
      },
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
      if (this.mailJetClient) {
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
      }
      logger.warn('Send email feature in not enabled')
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendRecoveryPasswordEmail = async ({ user }: { user: UserEntity }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const fullName = this.getFullName(user)

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                {
                  Email: user.email,
                  Name: fullName,
                },
              ],
              TextPart: 'Be Right - Réinitialisez votre mot de passe',
              TemplateID: MailjetTemplateId.RECOVERY_PASSWORD,
              TemplateLanguage: true,
              Subject: 'Be Right - Réinitialisez votre mot de passe',
              Variables: {
                link: `${isProduction() ? process.env.FRONT_URL : 'http://localhost:3000'}/modifier-mot-de-passe?email=${user.email}&token=${user.twoFactorRecoveryCode}`,
              },
            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }

      throw new ApiError(422, 'Service d\'envoie de mails non disponible')
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendRaiseAnswerEmail = async ({
    owner,
    event,
    employee,
    answer,
  }: {
    owner: UserEntity
    event: EventEntity
    employee: EmployeeEntity
    answer: AnswerEntity
  }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const fullName = this.getFullName(employee)

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                {
                  Email: employee.email,
                  Name: fullName,
                },
              ],
              TextPart: 'Be Right - Vous avez un document à signer',
              TemplateLanguage: true,
              TemplateID: MailjetTemplateId.RAISE_ANSWER,
              Subject: 'Be Right - Vous avez un document à signer',
              Variables: {
                recipientFirstName: employee.firstName,
                eventName: event.name,
                creator: this.getFullName(owner),
                link: `${isProduction()
                  ? process.env.FRONT_URL
                  : 'http://localhost:3000'}/answer/check-${answer.id}?email=${employee.email}&token=${answer.token}`,
              },
            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }

      throw new ApiError(422, 'Service d\'envoie de mails non disponible')
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendEventCompletedEmail = async ({
    users,
    event,
  }: {
    users: UserEntity[]
    event: EventEntity
  }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                users.map(user => ({
                  Email: user.email,
                  Name: this.getFullName(user),
                })),
              ],
              TextPart: 'Be Right - Tous les destinataires ont signé',
              TemplateLanguage: true,
              TemplateID: MailjetTemplateId.EVENT_COMPLETED,
              Subject: 'Be Right - Tous les destinataires ont signé',
              Variables: {
                eventName: event.name,
                link: `${isProduction()
                  ? process.env.FRONT_URL
                  : 'http://localhost:3000'}/evenement-show-id${event.id}`,
              },

            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }

      throw new ApiError(422, 'Service d\'envoie de mails non disponible')
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendEmployeeAnswerWithPDF = async ({
    creatorFullName,
    employee,
    companyName,
    pdfBase64,
    fileName,
  }: {
    creatorFullName: string
    employee: EmployeeEntity
    companyName: string
    pdfBase64: string
    fileName: string
  }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const fullName = this.getFullName(employee)

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                {
                  Email: employee.email,
                  Name: fullName,
                },
              ],
              TextPart: 'Be Right - Vous avez répondu',
              TemplateLanguage: true,
              TemplateID: MailjetTemplateId.EMPLOYEE_ANSWER,
              Subject: 'Be Right - Vous avez répondu',
              Variables: {
                creator: creatorFullName,
                company: companyName,
                recipientFirstName: fullName,
              },
              Attachments: [
                {
                  ContentType: 'application/pdf',
                  Filename: fileName,
                  Base64Content: pdfBase64,
                },
              ],
            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendMailewUserOnAccount = async ({
    creator,
    newUser,
    company,
  }: {
    creator: UserEntity
    newUser: UserEntity
    company: CompanyEntity
  }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const creatorFullName = this.getFullName(creator)

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                {
                  Email: newUser.email,
                  Name: this.getFullName(newUser),
                },
              ],
              TextPart: `Be Right - ${creatorFullName} vous a créé un compte`,
              TemplateLanguage: true,
              TemplateID: MailjetTemplateId.NEW_USER_ON_ACCOUNT,
              Subject: `Be Right - ${creatorFullName} vous a créé un compte`,
              Variables: {
                creator: creatorFullName,
                newUserFirstName: newUser.firstName,
                company: company.name,
                link: `${isProduction() ? process.env.FRONT_URL : 'http://localhost:3000'}/modifier-mot-de-passe?email=${newUser.email}&token=${newUser.twoFactorRecoveryCode}`,
              },
            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }

  public sendTwoFactorAuth = async ({
    twoFactorCode,
    creator,
    eventName,
    employee,
  }: {
    twoFactorCode: string
    creator: {
      firstName: string
      lastName: string
    }
    eventName: string
    employee: EmployeeEntity
  }) => {
    try {
      if (!this.mailJetClient) {
        logger.warn('Send email feature in not enabled')
        throw new ApiError(422, 'Service d\'envoie de mails non disponible')
      }

      const { response, body } = await this.mailJetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: this.FromObj,
              To: [
                {
                  Email: employee.email,
                  Name: this.getFullName(employee),
                },
              ],
              TextPart: `Be Right - ${employee.firstName} Votre code temporaire`,
              TemplateLanguage: true,
              TemplateID: MailjetTemplateId.TWO_FACTOR_AUTH_EMPLOYEE,
              Subject: `Be Right - ${employee.firstName} Votre code temporaire`,
              Variables: {
                creator: this.getFullName(creator),
                recipientFirstName: employee.firstName,
                eventName,
                twoFactorCode,
              },
            },
          ],
        })

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.statusText,
          body,
        }
      }
    } catch (error) {
      console.error(error, '<==== error')
      throw new ApiError(422, error)
    }
  }
}
