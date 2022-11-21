import { IWallet } from './IWallet'

export interface IUser {
    username: string
    email: string
    phone_number: string
    image: string | null
    password: string
    country: string
    city: string
    zip_code: string
    favorite: IUser[]
    wallet: IWallet
    preferred_lang: string
    reset_code?: string
    subscribed: boolean
}
