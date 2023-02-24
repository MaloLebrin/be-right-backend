import type AnswerEntity from '../entity/AnswerEntity'

export function isAnswerSigned(answer: AnswerEntity): boolean {
  return answer.signedAt !== null && answer.signedAt !== undefined
}

export function isAnswerTruthy(answer: AnswerEntity): boolean {
  return answer.hasSigned
}
