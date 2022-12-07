import { generate } from 'otp-generator'

export const generateOtp = () => {
    try {
        return generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true,
        })
    } catch (error) {
        console.error('OTP GENERATION ErR, ', error)
    }
}

export const AddMinutesToDate = (date: Date, minutes: number) => {
    return new Date(date.getTime() + minutes * 60000)
}
