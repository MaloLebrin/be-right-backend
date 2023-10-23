import { expect, test } from '@jest/globals'
import answersJSON from '../fixtures/premium/answers.json'
import {
  answerResponse,
  isAnswerSigned,
  isAnswerTruthy,
  secretAnswerKeys,
} from '../../utils/answerHelper'
import type AnswerEntity from '../../entity/AnswerEntity'

const answers = answersJSON as unknown as AnswerEntity[]

test('isAnswerSigned send right bool', () => {
  expect(isAnswerSigned(answers[0])).toBeFalsy()
  expect(isAnswerSigned(answers[2])).toBeTruthy()
})

test('isAnswerTruthy send right bool', () => {
  expect(isAnswerTruthy(answers[0])).toBeFalsy()
  expect(isAnswerTruthy(answers[2])).toBeTruthy()
})

test('answerResponse send not secrets keys', () => {
  answers.forEach(answer => {
    expect(Object.keys(answerResponse(answer)).every(key => !secretAnswerKeys.includes(key))).toBeTruthy()
  })
})
