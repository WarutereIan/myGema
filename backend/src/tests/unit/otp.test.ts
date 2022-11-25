import { describe, expect, it } from '@jest/globals'
import { generateOtp } from '../../helpers'

describe('Generate OTP', () => {
    let otp = generateOtp()!

    it('the generated OTP should be of length 4', async () => {
        expect(otp.length).toBe(4)
    })

    it('the OTP should only be of type numbers', async () => {
        // Use regex to check whether the OTP only contains digits
        expect(/^[0-9]+$/.test(otp)).toBeTruthy()
    })
})
