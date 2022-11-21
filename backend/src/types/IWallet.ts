import { WalletType } from '../constants'

export interface IWallet {
    public_key: string
    private_key: string
    wallet_type: WalletType
}
