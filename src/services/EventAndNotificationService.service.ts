import { type DataSource, In, type Repository } from 'typeorm'
import type EventEntity from '../entity/EventEntity'
import { getNotificationTypeByEventStatus } from '../utils/notificationHelper'
import { CompanyEntity } from '../entity/Company.entity'
import { NotificationSubcriptionEntity } from '../entity/notifications/NotificationSubscription.entity'
import { NotificationService } from './notifications/NotificationService'
import { EventNotificationService } from './notifications/EventNotificationService'

export class EventAndNotificationService {
  private CompanyRepository: Repository<CompanyEntity>
  private NotificationService: NotificationService
  private EventNotificationService: EventNotificationService
  private NotificationSubcriptionRepository: Repository<NotificationSubcriptionEntity>

  constructor(APP_SOURCE: DataSource) {
    if (APP_SOURCE.isInitialized) {
      this.CompanyRepository = APP_SOURCE.getRepository(CompanyEntity)
      this.NotificationService = new NotificationService(APP_SOURCE)
      this.EventNotificationService = new EventNotificationService(APP_SOURCE)
      this.NotificationSubcriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    }
  }

  public sendNotificationEventStatusChanged = async (event: EventEntity) => {
    const [eventNotif, company] = await Promise.all([
      this.EventNotificationService.createOne({
        name: getNotificationTypeByEventStatus(event),
        event,
      }),

      this.CompanyRepository.findOne({
        where: {
          id: event.companyId,
        },
        relations: {
          users: true,
        },
      }),
    ])

    if (company && company.userIds.length > 0) {
      const subscriptions = await this.NotificationSubcriptionRepository.find({
        where: {
          createdByUser: {
            id: In(company.userIds),
          },
          type: getNotificationTypeByEventStatus(event),
        },
      })

      await Promise.all(subscriptions.map(async subscription =>
        await this.NotificationService.createOne({
          type: getNotificationTypeByEventStatus(event),
          subscriber: subscription,
          eventNotificationId: eventNotif.id,
        }),
      ))
    }
  }
}
