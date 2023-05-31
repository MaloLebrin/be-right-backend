import dayjs from 'dayjs'
import { Role, SubscriptionEnum } from '../../types'
import { signatureAlbus } from './signatureFixture'

export const userCompanyFixturePremium = {
  companyName: 'Poudlard',
  email: 'albus@poudlard.com',
  firstName: 'Albus',
  lastName: 'Dumbledore',
  password: 'password',
  role: Role.OWNER,
  subscription: SubscriptionEnum.PREMIUM,
  signature: signatureAlbus,
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
    start: dayjs().subtract(2, 'month'),
    end: dayjs().add(7, 'month'),
  },
}

export const event2FixtureCompanyPremium = {
  address: {
    addressLine: 'Rue du chaudron baveur',
    addressLine2: '',
    postalCode: '44000',
    city: 'Godric\'s Hollow',
    country: 'Angleterre',
  },
  event: {
    name: 'Procès de Rogue',
    description: 'Severus Rogue (Severus Snape en anglais) est un personnage fictif créé par la romancière britannique J. K. Rowling pour la série Harry Potter. Professeur à l\'école de magie de Poudlard et directeur de la maison des Serpentard, il y est depuis des années un maître de la préparation des potions redouté et particulièrement partial, avant d\'être nommé par Albus Dumbledore au poste de professeur de défense contre les forces du Mal, qu\'il désire depuis longtemps. Après la mort de Dumbledore, il devient directeur de l\'école durant une année sous le règne de Voldemort. Personnage sombre, aigri et amer, il a une personnalité complexe, ambiguë et assez indéchiffrable ; il a un physique peu engageant et un ton sarcastique. Il est également décrit comme un élève et un homme très brillant, mais montre une antipathie et une animosité particulières envers le héros dès l\'arrivée de ce dernier à Poudlard, s\'ingéniant à le ridiculiser tout en le sauvant plusieurs fois de situations dangereuses. Au fil des années, leurs deux personnalités se heurtent de plus en plus et la relation entre le professeur et l\'élève se détériore au point que Harry Potter en arrive à douter de la loyauté de Rogue et à le considérer comme un ennemi majeur. Incarnant selon certains universitaires « la figure la plus trouble et ambivalente de la résistance », son rôle dans l\'intrigue est difficile à interpréter pour le lecteur, qui est fréquemment entraîné sur de fausses pistes. La nature de sa loyauté et de ses motivations est donc une question cruciale de la série, dont la réponse est donnée seulement à la fin du septième et dernier roman. ',
    start: dayjs().subtract(2, 'month'),
    end: dayjs().add(7, 'week'),
  },
}
export const event3FixtureCompanyPremium = {
  address: {
    addressLine: 'Rue du chaudron baveur',
    addressLine2: '',
    postalCode: '44000',
    city: 'Godric\'s Hollow',
    country: 'Angleterre',
  },
  event: {
    name: 'Création de Poudlard',
    description: 'Il y a plus de mille ans, les sorciers souffraient d\'incompréhension et de peur de la part de personnes dépourvues de pouvoirs magiques, nommées Moldus. Quatre sorciers exceptionnellement doués — Godric Gryffondor, Helga Poufsouffle, Rowena Serdaigle et Salazar Serpentard — décidèrent de fonder une école de magie permettant d\'offrir un refuge aux sorciers persécutés et de léguer leur savoir19. Rowena Serdaigle rêva d\'un cochon verruqueux la conduisant sur une falaise des Highlands20,Note 2. Les quatre amis se rendirent sur place et trouvèrent l\'emplacement approprié pour y construire le château destiné à abriter l\'école. Ils le nommèrent Poudlard (« Pou-du-lard ») en référence au curieux animal rêvé par Serdaigle20, puis partirent en quête de personnes possédant les aptitudes nécessaires pour enseigner la magie. ',
    start: dayjs().subtract(1000, 'year'),
    end: dayjs().subtract(500, 'year'),
  },
}
export const event4FixtureCompanyPremium = {
  address: {
    addressLine: 'Rue du chaudron baveur',
    addressLine2: '',
    postalCode: '44000',
    city: 'Godric\'s Hollow',
    country: 'Angleterre',
  },
  event: {
    name: 'Révolte des gobelins du XVIIIe siècle',
    description: 'La révolte des gobelins du xviiie siècle[1] (  Angl.  18th century goblin rebellion ), également appelé Révolte des gobelins de 1752[2] (  Angl.  Goblin Rebellion of 1752 ), est une série de rébellions de la part des gobelins',
    start: dayjs().add(3, 'week'),
    end: dayjs().add(20, 'week'),
  },
}

// MEDIUM

export const userCompanyFixtureMedium = {
  companyName: 'Mangemorts',
  email: 'tom.elvis.jedusor@poudlard.com',
  firstName: 'Tom',
  lastName: 'Jedusor',
  password: 'password',
  role: Role.OWNER,
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
      email: 'severus@mangemorts.com',
      firstName: 'Severus',
      lastName: 'Rogue',
      phone: '0987654321',
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
      bornAt: dayjs().subtract(36, 'year').toDate(),
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
    start: dayjs().subtract(1, 'month'),
    end: dayjs().add(7, 'month'),
  },
}

export const userNotUsed = {
  companyName: 'Poudlard founders',
  email: 'salazar.serpentard@poudlard.com',
  firstName: 'salazar',
  lastName: 'serpentard',
  password: 'password',
  role: Role.OWNER,
  subscription: SubscriptionEnum.MEDIUM,
  loggedAt: dayjs().subtract(2, 'year').toDate(),
}
