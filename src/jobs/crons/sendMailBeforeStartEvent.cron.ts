import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { Between, IsNull, MoreThan } from 'typeorm'
import { logger } from '../../middlewares/loggerService'
import AnswerEntity from '../../entity/AnswerEntity'
import { MailjetService } from '../../services'
import { isUserOwner } from '../../utils/userHelper'

export async function sendMailBeforeStartEvent(APP_SOURCE: DataSource) {
  try {
    const now = dayjs().locale('fr')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting cron send Mail before start event Reminder status at ${dateStart}`)

    const nowPLus6Days = now.add(6, 'day').toDate()
    const answerRepository = APP_SOURCE.getRepository(AnswerEntity)
    const answers = await answerRepository.find({
      where: [
        {
          signedAt: IsNull(),
          mailSendAt: MoreThan(nowPLus6Days),
          event: {
            start: Between(now.toDate(), nowPLus6Days),
            end: MoreThan(nowPLus6Days),
          },
        },
        {
          signedAt: IsNull(),
          mailSendAt: IsNull(),
          event: {
            start: Between(now.toDate(), nowPLus6Days),
            end: MoreThan(nowPLus6Days),
          },
        },
      ],
      relations: ['event', 'event.company', 'event.company.users', 'employee'],
    })

    if (answers.length > 0) {
      const MailJetService = new MailjetService(APP_SOURCE)
      await Promise.all(
        answers.map(answer => MailJetService.sendRaiseAnswerEmail({
          owner: answer.event.company.users.find(user => isUserOwner(user)),
          event: answer.event,
          employee: answer.employee,
          answer,
        })),
      )
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.info(`cron send Mail before start event Reminder status ended at ${dateEnd}`)
  }
}
