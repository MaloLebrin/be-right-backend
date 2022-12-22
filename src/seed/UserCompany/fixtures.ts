import dayjs from 'dayjs'
import { Role, SubscriptionEnum } from '../../types'

export const userCompanyFixturePremium = {
  companyName: 'Poudlard',
  email: 'albus@poudlard.com',
  firstName: 'Albus',
  lastName: 'Dumbledore',
  password: 'password',
  role: Role.COMPANY,
  subscription: SubscriptionEnum.PREMIUM,
}

export const subscriptionUserCompanyFixturePremium = {
  type: SubscriptionEnum.PREMIUM,
}

export const addressFixtureCompanyPremium = {
  addressLine: 'Rue du chaudron baveur',
  addressLine2: '',
  postalCode: '44000',
  city: 'Godric\'s Hollow',
  country: 'Angleterre',
}

export const employeesFixtureCompanyPremium = [
  {
    employee: {
      email: 'minerva@poudlard.com',
      firstName: 'Minerva',
      lastName: 'McGonagall',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Tour de Gryfondor Poudlard',
      addressLine2: '',
      postalCode: '44000',
      city: 'Poudlard',
      country: 'Ecosse',
    },
  },
  {
    employee: {
      email: 'severus@poudlard.com',
      firstName: 'Severus',
      lastName: 'Rogue',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Cachos salle commune serpentard',
      addressLine2: '',
      postalCode: '44000',
      city: 'Poudlard',
      country: 'Ecosse',
    },

  },
  {
    employee: {
      email: 'rubeus@poudlard.com',
      firstName: 'Rubeus',
      lastName: 'Hagrid',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Maison de Hagrid',
      addressLine2: '',
      postalCode: '44000',
      city: 'Poudlard',
      country: 'Ecosse',
    },
  },
  {
    employee: {
      email: 'horace@poudlard.com',
      firstName: 'Horace',
      lastName: 'Slughorn',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Bureau du maître des potions',
      addressLine2: '',
      postalCode: '44000',
      city: 'Poudlard',
      country: 'Ecosse',
    },
  },
]

export const eventFixtureCompanyPremium = {
  address: {
    addressLine: 'Rue du chaudron baveur',
    addressLine2: '',
    postalCode: '44000',
    city: 'Godric\'s Hollow',
    country: 'Angleterre',
  },
  event: {
    name: 'Coupe du monde de Quiddich',
    description: 'La Coupe du Monde de Quidditch est régulée par la Commission de Quidditch de la Confédération internationale des sorciers. D\'après les rumeurs, le règlement concernant l\'usage de la magie sur et en dehors du terrain remplirait dix-neuf volumes. Parmi ces règles, on peut noter l\'interdiction de l\'introduction d\'un dragon sur le terrain ou la prohibition de l\'altération de n\'importe quelle partie du corps de l\'arbitre, que celui-ci le veuille ou non. Les matchs sont organisés dans des lieux à l\'abri des Moldus fouineurs comme les landes isolées, les déserts ou les îles inhabitées, pour éviter les infractions au Code International du Secret Magique.',
    start: dayjs(),
    end: dayjs().add(7, 'week'),
  },
}

// MEDIUM

export const userCompanyFixtureMedium = {
  companyName: 'Mangemorts',
  email: 'tom.elvis.jedusor@poudlard.com',
  firstName: 'Tom',
  lastName: 'Jedusor',
  password: 'password',
  role: Role.COMPANY,
  subscription: SubscriptionEnum.MEDIUM,
}

export const subscriptionUserCompanyFixtureMedium = {
  type: SubscriptionEnum.MEDIUM,
}

export const addressFixtureCompanyMedium = {
  addressLine: 'Rue du chaudron baveur',
  addressLine2: '',
  postalCode: '44000',
  city: 'Godric\'s Hollow',
  country: 'Angleterre',
}

export const employeesFixtureCompanyMedium = [
  {
    employee: {
      email: 'bellatrix@mangemorts.com',
      firstName: 'Bellatrix',
      lastName: 'Lestrange',
      phone: '0987654321',
    },
    address: {
      addressLine: 'prison \'Azkaban',
      addressLine2: '',
      postalCode: '44000',
      city: 'No were',
      country: 'Ecosse',
    },
  },
  {
    employee: {
      email: 'severus@poudlard.com',
      firstName: 'Severus',
      lastName: 'Rogue',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Cachos salle commune serpentard',
      addressLine2: '',
      postalCode: '44000',
      city: 'Poudlard',
      country: 'Ecosse',
    },

  },
  {
    employee: {
      email: 'lucius@manoirdesmalfoy.com',
      firstName: 'Lucius',
      lastName: 'Malfoy',
      phone: '0987654321',
    },
    address: {
      addressLine: 'Manoir des Malfoy',
      addressLine2: '',
      postalCode: '44000',
      city: 'No were',
      country: 'Ecosse',
    },
  },
]

export const eventFixtureCompanyMedium = {
  address: {
    addressLine: 'Cimetière',
    addressLine2: '',
    postalCode: '44000',
    city: 'Godric\'s Hollow',
    country: 'Angleterre',
  },
  event: {
    name: 'Tournoi des Trois Sorciers',
    description: 'Le Tournoi des Trois Sorciers est un concours de magie où s\'affrontent les trois principales écoles de sorcellerie européennes : Poudlard, Durmstrang et Beauxbâtons. Le vainqueur se voit décerner la Coupe du Tournoi des Trois Sorciers et mille Gallions. ',
    start: dayjs(),
    end: dayjs().add(7, 'week'),
  },
}
