import UserService from '../../services/UserService'

export const photographerFixture1 = {
  email: 'rita.skitter@gazette.com',
  firstName: 'Rita',
  lastName: 'Skitter',
  companyName: 'Gazette du sorcier',
}

export const photographerFixture2 = {
  email: 'lee.jordan@poudlard.com',
  firstName: 'Lee',
  lastName: 'Jordan',
  companyName: 'Poudlard',
}

export const photographerFixture3 = {
  email: 'elfiaste.dodge@writter.com',
  firstName: 'Elfiaste',
  lastName: 'Dodge',
  companyName: 'Writter',
}

export const photographerFixture4 = {
  email: 'batilda.tourdesac@writter.com',
  firstName: 'Batilda',
  lastName: 'Tour de sac',
  companyName: 'Writter',
}

export async function createPhotographers() {
  const photographersPayload = [
    photographerFixture1,
    photographerFixture2,
    photographerFixture3,
    photographerFixture4,
  ]

  return await Promise.all(photographersPayload.map(async photographer =>
    await UserService.createPhotographer(photographer),
  ))
}
