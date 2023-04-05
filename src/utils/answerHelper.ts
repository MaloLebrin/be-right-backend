import type AnswerEntity from '../entity/AnswerEntity'

export function isAnswerSigned(answer: AnswerEntity): boolean {
  return answer.signedAt !== null && answer.signedAt !== undefined
}

export function isAnswerTruthy(answer: AnswerEntity): boolean {
  if (answer.hasSigned === null) {
    return false
  }
  return answer.hasSigned
}

export const secretAnswerKeys = [
  'twoFactorSecret',
  'twoFactorCode',
  'token',
]

export function answerResponse(answer: AnswerEntity) {
  const entityReturned = {}
  for (const [key, value] of Object.entries(answer)) {
    if (!secretAnswerKeys.includes(key)) {
      // eslint-disable-next-line security/detect-object-injection
      entityReturned[key] = value
    }
  }
  return entityReturned as AnswerEntity
}
