import type { DataSource, EntityManager } from 'typeorm'
import { AddressService } from '../../services'
import AnswerService from '../../services/AnswerService'
import { CompanyService } from '../../services/CompanyService'
import EmployeeService from '../../services/employee/EmployeeService'
import EventService from '../../services/EventService'
import UserService from '../../services/UserService'

export class BaseSeedClass {
  getManager: EntityManager

  AnswerService: AnswerService
  AddressService: AddressService
  UserService: UserService
  EmployeeService: EmployeeService
  EventService: EventService
  CompanyService: CompanyService

  constructor(SEED_SOURCE: DataSource) {
    this.getManager = SEED_SOURCE.manager
    this.AnswerService = new AnswerService(SEED_SOURCE)
    this.AddressService = new AddressService(SEED_SOURCE)
    this.UserService = new UserService(SEED_SOURCE)
    this.EmployeeService = new EmployeeService(SEED_SOURCE)
    this.EventService = new EventService(SEED_SOURCE)
    this.CompanyService = new CompanyService(SEED_SOURCE)
  }
}
