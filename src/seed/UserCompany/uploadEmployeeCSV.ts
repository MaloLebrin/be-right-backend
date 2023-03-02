import csv from 'csvtojson'
import type { DataSource } from 'typeorm'
import type { UploadCSVEmployee } from '../../types'
import EmployeeService from '../../services/employee/EmployeeService'
import { AddressService } from '../../services'

export async function uploadCSVEmployeeSeed(userId: number, SEED_SOURCE: DataSource) {
  const pathF = '/app/src/seed/UserCompany/testcsv.csv'

  const employeeService = new EmployeeService(SEED_SOURCE)
  const addressService = new AddressService(SEED_SOURCE)

  const newEmployeesData: UploadCSVEmployee[] = await csv().fromFile(pathF)

  await Promise.all(newEmployeesData.map(async ({
    firstName,
    lastName,
    addressLine,
    postalCode,
    city,
    country,
    email,
    phone,
  }) => {
    const isEmployeeAlreadyExist = await employeeService.isEmployeeAlreadyExist(email)

    if (!isEmployeeAlreadyExist) {
      const emp = await employeeService.createOne({
        firstName,
        lastName,
        email,
        phone,
      }, userId)

      if (emp) {
        await addressService.createOne({
          address: {
            addressLine,
            postalCode,
            city,
            country,
          },
          employeeId: emp.id,
        })
      }
    }
  }))
}
