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
