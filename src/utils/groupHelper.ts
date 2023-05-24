import type { UploadCSVEmployee } from '../types/Employee'

export const firstNameFieldPossibilities = [
  'prénom',
  'prenom',
  'prenoms',
  'firstName',
]

export const lastNameFieldPossibilities = [
  'nom',
  'Nom',
  'noms',
  'lastName',
]

const addressLineFieldPossiblities = [
  'rue',
  'street',
  'address',
  'addressLine',
]

const postalCodeFieldPossibilities = [
  'code postal',
  'postalCode',
]

const cityFieldPossibilities = [
  'ville',
  'town',
  'city',
  'metropole',
]

const countryFieldPossibilities = [
  'pays',
  'country',
  'nation',
]

const emailFieldPossibilities = [
  'email',
  'mail',
  'adresse email',
  'adresse mail',
  'e-mail',
  'adresse e-mail',
  'adresse-mail',
  'courriel',
]

const phoneFieldPossibilities = [
  'phone',
  'mobile',
  'portable',
  'téléphone portable',
  'téléphone mobile',
  'téléphone',
  'telephone',
  'telephone mobile',
  'telephone portable',
]

export function parseGroupCSVFields(employees: UploadCSVEmployee[]) {
  return employees.map(emp => {
    const employee = {} as UploadCSVEmployee
    for (const [key, value] of Object.entries(emp)) {
      const formatedKey = key.toLowerCase()

      if (lastNameFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.lastName = value
      }

      if (firstNameFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.firstName = value
      }

      if (addressLineFieldPossiblities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.addressLine = value
      }

      if (postalCodeFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.postalCode = value
      }

      if (postalCodeFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.postalCode = value
      }

      if (cityFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.city = value
      }

      if (countryFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.country = value
      }

      if (emailFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.email = value
      }

      if (phoneFieldPossibilities.some(str => formatedKey.match(str.toLowerCase()))) {
        employee.phone = value
      }
    }

    return employee
  })
}
