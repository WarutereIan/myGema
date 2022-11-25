import { describe, expect, it, test } from '@jest/globals'
import { request } from '../../helpers'

describe('Send OTP', () => {
    describe('given a phone_number', () => {
        // should save a record of {phonenumber, verified as false, otp, created_at, expiritation} to mongoDb

        // should respond with status code 200
        test('should respond with a 200 status code', async () => {
            const response = await request.post('/api/v1/otp/send').send({
                phonenumber: '254123456789',
            })

            expect(response.statusCode).toBe(200)
        })
    })

    describe('when phone_number is missing', () => {
        // should respond with status code 500
        test('should return a 500 status code', async () => {
            const response = await request.post('/api/v1/otp/send')

            expect(response.statusCode).toBe(400)
        })
    })
})
