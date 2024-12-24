import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { noNull } from '@antfu/utils'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { StripeCheckoutSessionService } from '../../services/stripe/stripeCheckout.service'
import { ModePaymentEnum, type StripeCheckoutSessionCreationPayload } from '../../types/Stripe'
import { DraftEventService } from '../../services/DraftEventService.service'
import { EventCreateService } from '../../services/event/eventCreateService.service'
import EventService from '../../services/EventService'
import AnswerService from '../../services/AnswerService'
import { AddressService } from '../../services'
import { SubscriptionService } from '../../services/SubscriptionService'
import { isProduction } from '../../utils/envHelper'
import { isPremiumSubscription, isSubscriptionExpired } from '../../utils/subscriptionHelper'

export class StripeController {
  private StripeCustomerService: StripeCustomerService
  private StripeCheckoutSessionService: StripeCheckoutSessionService
  private DraftEventService: DraftEventService
  private EventCreateService: EventCreateService
  private EventService: EventService
  private AnswerService: AnswerService
  private AddressService: AddressService
  private SubscriptionService: SubscriptionService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
      this.StripeCheckoutSessionService = new StripeCheckoutSessionService()
      this.DraftEventService = new DraftEventService(DATA_SOURCE)
      this.EventCreateService = new EventCreateService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.AddressService = new AddressService(DATA_SOURCE)
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.SubscriptionService = new SubscriptionService(DATA_SOURCE)
    }
  }

  public payEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user

      const {
        priceId,
        event,
        address,
        photographerId,
      }: StripeCheckoutSessionCreationPayload = req.body

      const userSubscription = await this.SubscriptionService.getOneByCompanyId(user.companyId)

      if (isPremiumSubscription(userSubscription) && !isSubscriptionExpired(userSubscription)) {
        const { event: createdEvent } = await this.EventCreateService.createEventWithRelations({
          event,
          address,
          companyId: ctx.user.companyId,
          photographerId,
          user: ctx.user,
        })

        return res.status(200).json({ sessionUrl: `${isProduction() ? 'https://be-right.co' : 'http://localhost:3000'}/evenement/show-${createdEvent.id}` })
      }

      const stripeCustomer = await this.StripeCustomerService.getStripeCustomerForUser(user)

      if (!stripeCustomer || !user.email || !user.companyId) {
        throw new ApiError(500, 'Une erreur s\'est produite impossible d\'identifier l\'utilisateur')
      }

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
        this.DraftEventService.getDraftEventByCheckoutSessionId(sessionId, {
          includeSoftDeleted: true,
        }),
      ])

      if (!session) {
        throw new ApiError(500, 'Une erreur s\'est produite impossible de trouver la session de paiement')
      }

      if (session.payment_status !== 'paid') {
        throw new ApiError(401, 'Le paiement n\'a pas été effectué')
      }

      if (noNull(draftEvent.deletedAt)) {
        const newEventId = draftEvent.eventId
        const [event, answers] = await Promise.all([
          this.EventService.getOneWithoutRelations(newEventId),
          this.AnswerService.getAllAnswersForEvent(newEventId),
        ])
        const address = await this.AddressService.getOne(event.addressId)

        return res.status(200).json({
          event,
          address,
          answers,
          message: 'Les données ont été récupérées.',
        })
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
      await this.DraftEventService.addEventOnDraftEvent(draftEvent.id, event.id)
      await this.DraftEventService.deleteDraftEventByCheckoutSessionId(sessionId)

      return res.status(200).json({
        event,
        address,
        answers,
        message: 'L\'événement a été créé avec succès.',
      })
    })
  }
}
