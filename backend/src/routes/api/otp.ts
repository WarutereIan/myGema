import { Router } from 'express'
import { check } from 'express-validator'
import { AddMinutesToDate, generateOtp } from '../../helpers'

const router = Router()

router.post('/send', async (req: any, res: any) => {
    try {
        // Generate OTP
        let otp = await generateOtp()

        // Get Phonenumber from Body
        let { phonenumber } = req.body

        // Define time created and expiration (10 min)
        let createdAt = new Date()
        let expiration = AddMinutesToDate(createdAt, 10)

        if (!phonenumber) res.send(400)

        // TODO: add send sms function
        res.send(200)
    } catch (error) {
        console.log('send otp error < >', error)
    }
})

module.exports = router
