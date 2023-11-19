import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import { launchPuppeteer } from '../../../utils/puppeteerHelper'
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

    const fileName = `droit-image-${answer.employee.slug}.pdf`
    const filePath = `/app/src/uploads/${fileName}`

    const browser = await launchPuppeteer()

    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      authorization: `Bearer ${creatorToken}`,
    })
    await page.goto(url)
    const pdf = await page.pdf({ path: filePath, format: 'a4', printBackground: true })
    await browser.close()

    await mailJetService.sendEmployeeAnswerWithPDF({
      creatorFullName,
      employee: answer.employee,
      companyName,
      pdfBase64: pdf.toString('base64'),
      fileName,
    })
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
