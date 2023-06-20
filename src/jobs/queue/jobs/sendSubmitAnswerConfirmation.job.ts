import type { Job } from 'bullmq'
import type { Request } from 'express'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import { launchPuppeteer } from '../../../utils/puppeteerHelper'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class SendSubmitAnswerConfirmationJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    req: Request
    answer: AnswerEntity
    creatorFullName: string
    companyName: string
  }) {
    super()
  }

  handle = async () => {
    const {
      req,
      answer,
      creatorFullName,
      companyName,
    } = this.payoad

    const mailJetService = new MailjetService(APP_SOURCE)

    const baseUrl = `${req.protocol}://${req.get('host')}`
    const url = `${baseUrl}/answer/view/?ids=${req.query.ids}`
    const fileName = `droit-image-${answer.employee.slug}.pdf`
    const filePath = `/app/src/uploads/${fileName}`

    const browser = await launchPuppeteer()

    const page = await browser.newPage()

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
