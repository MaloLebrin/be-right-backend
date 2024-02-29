import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { StripeCheckoutSessionService } from '../../services/stripe/stripeCheckout.service'
import { ModePaymentEnum, type StripeCheckoutSessionCreationPayload } from '../../types/Stripe'
import { DraftEventService } from '../../services/DraftEventService.service'
import { EventCreateService } from '../../services/event/eventCreateService.service'

export class StripeController {
  private StripeCustomerService: StripeCustomerService
  private StripeCheckoutSessionService: StripeCheckoutSessionService
  private DraftEventService: DraftEventService
  private EventCreateService: EventCreateService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
      this.StripeCheckoutSessionService = new StripeCheckoutSessionService()
      this.DraftEventService = new DraftEventService(DATA_SOURCE)
      this.EventCreateService = new EventCreateService(DATA_SOURCE)
    }
  }

  public payEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user
      const stripeCustomer = await this.StripeCustomerService.getStripeCustomerForUser(user)

      if (!stripeCustomer || !user.email || !user.companyId) {
        throw new ApiError(500, 'Une erreur s\'est produite impossible d\'identifier l\'utilisateur')
      }

      const {
        priceId,
        event,
        address,
        photographerId,
      }: StripeCheckoutSessionCreationPayload = req.body

      const session = await this.StripeCheckoutSessionService.createStripeCheckoutSession({
        stripeCustomerId: stripeCustomer.id,
        modePayment: ModePaymentEnum.PAYMENT,
        products: [
          {
            price: priceId,
            quantity: event.employeeIds?.length,
          },
        ],
      })

      if (!session) {
        throw new ApiError(500, 'Une erreur s\'est produite lors de la création de la session de paiement')
      }

      const draftEvent = await this.DraftEventService.createDraftEvent({
        checkoutSessionId: session.id,
        companyId: user.companyId,
        data: {
          event,
          address,
          photographerId,
        },
      })

      if (!draftEvent) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      return res.status(200).json({ sessionUrl: session.url })
    })
  }

  public successfull = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user || !ctx.user.companyId) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const { sessionId } = req.params
      const [session, draftEvent] = await Promise.all([
        this.StripeCheckoutSessionService.getStripeCheckoutSession(sessionId),
        this.DraftEventService.getDraftEventByCheckoutSessionId(sessionId),
      ])

      if (!session || !draftEvent) {
        throw new ApiError(500, 'Une erreur s\'est produite impossible de trouver la session de paiement')
      }

      if (session.payment_status !== 'paid') {
        throw new ApiError(401, 'Le paiement n\'a pas été effectué')
      }

      const { event, address, answers } = await this.EventCreateService.createEventWithRelations({
        event: draftEvent.eventData,
        address: draftEvent.addressData,
        companyId: ctx.user.companyId,
        photographerId: draftEvent.eventData.photographerId,
        user: ctx.user,
      })

      if (!event || !address) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      await this.DraftEventService.deleteDraftEventByCheckoutSessionId(sessionId)

      return res.status(200).json({ event, address, answers })
    })
  }
}
