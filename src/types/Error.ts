export interface ErrorType extends Error {
  message: string
  stack: string
  cause: string
  status: number
}
