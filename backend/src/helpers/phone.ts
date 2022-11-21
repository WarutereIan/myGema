export class PhoneNumber {
    private readonly number: string

    constructor(number: string) {
        this.number = PhoneNumber.normalizePhoneNumber(number)
    }

    public getNumber() {
        return this.number
    }

    static normalizePhoneNumber = (phone: string) => {
        if (phone.startsWith('+')) return phone

        if (phone.startsWith('0')) return `+254${phone.substring(1)}`

        return `+254${phone}`
    }

    static removeCountryCode = (phone: string) => {
        phone = PhoneNumber.normalizePhoneNumber(phone)

        return `0${phone.substring(4)}`
    }

    static removePlus = (phone: string) => {
        phone = PhoneNumber.normalizePhoneNumber(phone)

        return phone.substring(1)
    }
}
