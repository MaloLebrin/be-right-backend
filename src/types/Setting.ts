import type { SettingEntity } from '../entity/SettingEntity'

export enum ThemeEnum {
  LIGHT = 'light',
  DARK = 'dark',
}

export const ThemeEnumArray = Object.values(ThemeEnum)

export type CreateSettingPayload = Partial<Omit<SettingEntity, 'userId' | 'user'>>
