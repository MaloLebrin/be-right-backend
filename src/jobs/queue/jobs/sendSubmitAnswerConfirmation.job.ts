import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import { generatePdfFromUrl } from '../../../utils/puppeteerHelper'
import { isProduction } from '../../../utils/envHelper'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class SendSubmitAnswerConfirmationJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    url: string
    answer: AnswerEntity
    creatorFullName: string
    creatorToken: string
    companyName: string
  }) {
    super()
  }

  handle = async () => {
    const {
      url,
      answer,
      creatorFullName,
      creatorToken,
      companyName,
    } = this.payoad

    const mailJetService = new MailjetService(APP_SOURCE)

    const { content, fileName } = await generatePdfFromUrl({
      url,
      fileName: `droit-image-${answer.employee.slug}.pdf`,
      token: creatorToken,
      isMadeByBrowserless: isProduction(),
    })

    await mailJetService.sendEmployeeAnswerWithPDF({
      creatorFullName,
      employee: answer.employee,
      companyName,
      pdfBase64: content,
      fileName,
    })
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
