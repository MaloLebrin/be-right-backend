import type { JwtPayload } from 'jsonwebtoken'

export interface DecodedJWTToken extends JwtPayload {
  employeeId: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  uniJWT: string
}
