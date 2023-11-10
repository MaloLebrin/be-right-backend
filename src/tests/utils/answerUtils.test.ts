import { describe, expect, test } from '@jest/globals'
import answersJSON from '../fixtures/premium/answers.json'
import {
  answerResponse,
  isAnswerSigned,
  isAnswerTruthy,
  secretAnswerKeys,
} from '../../utils/answerHelper'
import type AnswerEntity from '../../entity/AnswerEntity'

const answers = answersJSON as unknown as AnswerEntity[]

describe('isAnswerSigned isAnswerSigned send right bool', () => {
  test('null | undefined', () => {
    expect(isAnswerSigned({} as AnswerEntity)).toBeFalsy()
    expect(isAnswerSigned({} as AnswerEntity)).toBeFalsy()
  })

  test('have answer object', () => {
    expect(isAnswerSigned(answers[0])).toBeFalsy()
    expect(isAnswerSigned(answers[2])).toBeTruthy()
  })
})

describe('isAnswerTruthy', () => {
  test('isAnswerTruthy send right bool', () => {
    expect(isAnswerSigned({} as AnswerEntity)).toBeFalsy()
    expect(isAnswerSigned({} as AnswerEntity)).toBeFalsy()
    expect(isAnswerTruthy(answers[0])).toBeFalsy()
    expect(isAnswerTruthy(answers[2])).toBeTruthy()
  })
})

describe('answerResponse', () => {
  test('answerResponse send not secrets keys', () => {
    answers.forEach(answer => {
      expect(Object.keys(answerResponse(answer)).every(key => !secretAnswerKeys.includes(key))).toBeTruthy()
    })
  })
})
