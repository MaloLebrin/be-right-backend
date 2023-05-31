import type { Job } from 'bullmq'
import puppeteer from 'puppeteer'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import { APP_SOURCE } from '../../..'
import AnswerEntity from '../../../entity/AnswerEntity'
import { ApiError } from '../../../middlewares/ApiError'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class SendSubmitAnswerConfirmationJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    url: string
    answerId: number
    creatorFullName: string
    companyName: string
  }) {
    super()
  }

  handle = async () => {
    const {
      url: baseUrl,
      answerId,
      creatorFullName,
      companyName,
    } = this.payoad

    const mailJetService = new MailjetService(APP_SOURCE)

    const AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)

    if (!mailJetService || !AnswerRepository) {
      throw new ApiError(422, 'Une erreur est survenue')
    }

    const answer = await AnswerRepository.findOne({
      where: { id: answerId },
      relations: ['employee'],
    })

    if (!answer) {
      throw new ApiError(422, 'Réponse introuvable')
    }

    const url = `${baseUrl}/answer/view/?ids=${answerId}`
    const fileName = `droit-image-${answer.employee.slug}.pdf`
    const filePath = `/app/src/uploads/${fileName}`

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-gpu',
      ],
    })

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
