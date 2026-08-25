import { describe, expect, it } from 'vitest'
import {
  formatEchoNorm,
  getDogEchoNorms,
  getDogEchoWeightBucket,
} from './echoNorms'

describe('dog echo norms', () => {
  it('uses the lower dog table row by pounds', () => {
    expect(getDogEchoWeightBucket(10)).toBe(22)
    expect(getDogEchoWeightBucket(7.89)).toBe(17)
    expect(getDogEchoWeightBucket(90.9)).toBe(200)
  })

  it('returns dog table ranges in centimeters for a 10 kg dog', () => {
    const norms = getDogEchoNorms(10)

    expect(norms?.ivsd).toMatchObject({ min: 0.73, max: 0.85, unit: 'см' })
    expect(norms?.lvfwd).toMatchObject({ min: 0.58, max: 0.69, unit: 'см' })
    expect(norms?.ivss).toMatchObject({ min: 1.09, max: 1.23, unit: 'см' })
    expect(norms?.lvfws).toMatchObject({ min: 0.96, max: 1.09, unit: 'см' })
    expect(norms?.ao).toMatchObject({ min: 0.93, max: 2.31, unit: 'см' })
    expect(norms?.la).toMatchObject({ min: 1.18, max: 2.72, unit: 'см' })
    expect(formatEchoNorm(norms?.ivsd)).toBe('0.73-0.85')
  })

  it('keeps LVIDd and LVIDs as input-only fields and uses their table ranges for KDRn/KSRn norms', () => {
    const norms = getDogEchoNorms(10)

    expect(norms?.lvidd.hasNorm).toBe(false)
    expect(norms?.lvidd.label).toBe('КДР/ЛЖд')
    expect(norms?.lvids.hasNorm).toBe(false)
    expect(norms?.lvids.label).toBe('КСР/ЛЖс')
    expect(norms?.lviddn).toMatchObject({ min: 1.09, max: 1.69, unit: '' })
    expect(norms?.lvidsn).toMatchObject({ min: 0.56, max: 1.05, unit: '' })
  })

  it('matches edge table rows from the dog source table', () => {
    const smallDog = getDogEchoNorms(0.5)
    const largeDog = getDogEchoNorms(90.9)

    expect(smallDog?.ivsd).toMatchObject({ min: 0.44, max: 0.68 })
    expect(smallDog?.lviddn).toMatchObject({ min: -0.94, max: 0.51 })
    expect(smallDog?.lvidsn).toMatchObject({ min: -1.08, max: 0.2 })
    expect(smallDog?.ao).toMatchObject({ min: -1.13, max: 0.26 })

    expect(largeDog?.ivsd).toMatchObject({ min: 1.46, max: 1.88 })
    expect(largeDog?.lviddn).toMatchObject({ min: 1.11, max: 1.45 })
    expect(largeDog?.lvfwd).toMatchObject({ min: 1.19, max: 1.53 })
    expect(largeDog?.ivss).toMatchObject({ min: 2.31, max: 2.77 })
    expect(largeDog?.lvidsn).toMatchObject({ min: 0.62, max: 0.88 })
    expect(largeDog?.lvfws).toMatchObject({ min: 1.92, max: 2.35 })
    expect(largeDog?.ao).toMatchObject({ min: 2.36, max: 3.83 })
    expect(largeDog?.la).toMatchObject({ min: 2.99, max: 4.63 })
  })
})
