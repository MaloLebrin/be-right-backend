import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { LessThan } from 'typeorm'
import { logger } from '../../middlewares/loggerService'
import AnswerEntity from '../../entity/AnswerEntity'
import { MailjetService } from '../../services'
import { isUserOwner } from '../../utils/userHelper'

export async function sendMailBeforeStartEvent(APP_SOURCE: DataSource) {
  try {
    const now = dayjs().locale('fr')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting cron send Mail before start event Reminder status at ${dateStart}`)

    const nowPLus6Days = now.add(6, 'day')
    const answerRepository = APP_SOURCE.getRepository(AnswerEntity)
    const answers = await answerRepository.find({
      where: [
        {
          event: {
            start: LessThan(nowPLus6Days.toDate()),
          },
        },
        {
          event: {
            end: LessThan(nowPLus6Days.toDate()),
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
