import { expect, test } from 'vitest'
import csv from 'csvtojson'
import {
  parseGroupCSVFields,
} from '../../utils/groupHelper'
import {
  hasOwnProperty,
} from '../../utils/objectHelper'
import type { UploadCSVEmployee } from '../../types/Employee'

const data = {
  'Prénom': 'Jason',
  'nom': 'Fouasson',
  'rue': '11 rue Bertrand Geslin',
  'code postal': '44000',
  'ville': 'Nantes',
  'pays': 'France',
  'email': 'jason@lamacompta.com',
  'mobile': '202020202',
}

test('parseGroupCSVFields parse correctly data', () => {
  const parseEmployees = parseGroupCSVFields([data] as unknown as UploadCSVEmployee[])

  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'firstName'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'lastName'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'addressLine'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'postalCode'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'city'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'country'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'email'))).toBeTruthy()
  expect(parseEmployees.every(employee => hasOwnProperty(employee, 'phone'))).toBeTruthy()
})

test('parseGroupCSVFields parse correctly datatestCSV', async () => {
  const newEmployeesData: UploadCSVEmployee[] = await csv().fromFile('src/seed/UserCompany/testcsv.csv')

  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'firstName'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'lastName'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'addressLine'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'postalCode'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'city'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'country'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'email'))).toBeTruthy()
  expect(newEmployeesData.every(employee => hasOwnProperty(employee, 'phone'))).toBeTruthy()
})
