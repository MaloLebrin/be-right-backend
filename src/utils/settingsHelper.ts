import type { SettingEntity } from '../entity/SettingEntity'

export function composeSettingPayload(payload: Partial<SettingEntity>): Partial<Omit<SettingEntity, 'userId' | 'user'>> {
  const newPayload: Partial<Omit<SettingEntity, 'userId' | 'user'>> = {}

  for (const key in payload) {
    // eslint-disable-next-line security/detect-object-injection
    if (payload[key] !== undefined && key !== 'userId' && key !== 'user') {
      // eslint-disable-next-line security/detect-object-injection
      newPayload[key] = payload[key]
    }
  }

  return newPayload
}
