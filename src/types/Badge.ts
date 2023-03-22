export enum BadgeEnumName {
  DELETE_10_RECIPIENTS = 'DELETE_10_RECIPIENTS',
  DELETE_50_RECIPIENTS = 'DELETE_50_RECIPIENTS',
  DELETE_25_RECIPIENTS = 'DELETE_25_RECIPIENTS',
  CREATE_10_RECIPIENTS = 'CREATE_10_RECIPIENTS',
  CREATE_25_RECIPIENTS = 'CREATE_25_RECIPIENTS',
  CREATE_50_RECIPIENTS = 'CREATE_50_RECIPIENTS',

  DELETE_10_EVENTS = 'DELETE_10_EVENTS',
  DELETE_25_EVENTS = 'DELETE_25_EVENTS',
  DELETE_50_EVENTS = 'DELETE_50_EVENTS',
  CREATE_10_EVENTS = 'CREATE_10_EVENTS',
  CREATE_25_EVENTS = 'CREATE_25_EVENTS',
  CREATE_50_EVENTS = 'CREATE_50_EVENTS',
  COMPLETED_10_EVENTS = 'COMPLETED_10_EVENTS',
  COMPLETED_25_EVENTS = 'COMPLETED_25_EVENTS',
  COMPLETED_50_EVENTS = 'COMPLETED_50_EVENTS',

  BASIC_SUBSCRIPTION = 'BASIC_SUBSCRIPTION',
  MEDIUM_SUBSCRIPTION = 'MEDIUM_SUBSCRIPTION',
  PREMIUM_SUBSCRIPTION = 'PREMIUM_SUBSCRIPTION',
}

export enum BadgeEnumLabel {
  DELETE_10_RECIPIENTS = 'Supprimer 10 destinataires',
  DELETE_50_RECIPIENTS = 'Supprimer 50 destinataires',
  DELETE_25_RECIPIENTS = 'Supprimer 25 destinataires',
  CREATE_10_RECIPIENTS = 'Créer 10 destinataires',
  CREATE_25_RECIPIENTS = 'Créer 25 destinataires',
  CREATE_50_RECIPIENTS = 'Créer 50 destinataires',

  DELETE_10_EVENTS = 'Supprimer 10 événements',
  DELETE_25_EVENTS = 'Supprimer 25 événements',
  DELETE_50_EVENTS = 'Supprimer 50 événements',
  CREATE_10_EVENTS = 'Créer 10 événements',
  CREATE_25_EVENTS = 'Créer 25 événements',
  CREATE_50_EVENTS = 'Créer 50 événements',
  COMPLETED_10_EVENTS = 'Compléter 10 événements',
  COMPLETED_25_EVENTS = 'Compléter 25 événements',
  COMPLETED_50_EVENTS = 'Compléter 50 événements',

  BASIC_SUBSCRIPTION = 'Souscrire à un abonnement BASIC',
  MEDIUM_SUBSCRIPTION = 'Souscrire à un abonnement MEDIUM',
  PREMIUM_SUBSCRIPTION = 'Souscrire à un abonnement PREMIUM',
}

export enum BadgeEnumIcon {
  DELETE_10_RECIPIENTS = 'UserMinusIcon',
  DELETE_50_RECIPIENTS = 'UserMinusIcon',
  DELETE_25_RECIPIENTS = 'UserMinusIcon',
  CREATE_10_RECIPIENTS = 'UserPlusIcon',
  CREATE_25_RECIPIENTS = 'UserPlusIcon',
  CREATE_50_RECIPIENTS = 'UserPlusIcon',

  DELETE_10_EVENTS = 'CalendarIcon',
  DELETE_25_EVENTS = 'CalendarIcon',
  DELETE_50_EVENTS = 'CalendarIcon',
  CREATE_10_EVENTS = 'CalendarDaysIcon',
  CREATE_25_EVENTS = 'CalendarDaysIcon',
  CREATE_50_EVENTS = 'CalendarDaysIcon',
  COMPLETED_10_EVENTS = 'CheckBadgeIcon',
  COMPLETED_25_EVENTS = 'CheckBadgeIcon',
  COMPLETED_50_EVENTS = 'CheckBadgeIcon',

  BASIC_SUBSCRIPTION = 'ShoppingCartIcon',
  MEDIUM_SUBSCRIPTION = 'ShoppingCartIcon',
  PREMIUM_SUBSCRIPTION = 'ShoppingCartIcon',

}

export const BadgeNameArray = Object.values(BadgeEnumName)
