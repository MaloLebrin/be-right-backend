import AnswerEntity from "../entity/AnswerEntity"

export function isAnswerSigned(answer: AnswerEntity): boolean {
  return answer.signedAt !== null
}

export function isAnswerTruthy(answer: AnswerEntity): boolean {
  return answer.hasSigned
}
