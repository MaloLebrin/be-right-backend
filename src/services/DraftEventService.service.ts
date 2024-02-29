import type { DataSource, Repository } from 'typeorm'
import { DraftEventEntity } from '../entity/event/DraftEvent.entity'
import type { EventWithRelationsCreationPayload } from '../types/Event'

export class DraftEventService {
  private repository: Repository<DraftEventEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(DraftEventEntity)
  }

  private composeDraftEvent = ({
    companyId,
    checkoutSessionId,
    data,
  }: {
    companyId: number
    checkoutSessionId: string
    data: EventWithRelationsCreationPayload
  }) => {
    const { event, address, photographerId } = data
    return {
      company: {
        id: companyId,
      },
      checkoutSessionId,
      addressData: address,
      eventData: { ...event, photographerId },
    }
  }

  public async createDraftEvent({
    companyId,
    checkoutSessionId,
    data,
  }: {
    companyId: number
    checkoutSessionId: string
    data: EventWithRelationsCreationPayload
  }) {
    const draftEvent = this.repository.create(this.composeDraftEvent({
      companyId,
      checkoutSessionId,
      data,
    }))
    return this.repository.save(draftEvent)
  }

  public async getDraftEventByCheckoutSessionId(checkoutSessionId: string) {
    return this.repository.findOne({
      where: {
        checkoutSessionId,
      },
    })
  }

  public async deleteDraftEventByCheckoutSessionId(checkoutSessionId: string) {
    return this.repository.delete({
      checkoutSessionId,
    })
  }
}
