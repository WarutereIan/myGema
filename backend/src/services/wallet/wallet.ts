import BN from 'bn.js'
import {
    keyStores,
    connect,
    KeyPair,
    Connection,
    utils,
    ConnectConfig,
    Account,
} from 'near-api-js'
import { config } from '../../config'

class WalletService {
    keyPair: KeyPair
    keyStore: keyStores.InMemoryKeyStore
    connection: any
    config: ConnectConfig
    network: string
    fundingAcc: string

    constructor() {
        this.fundingAcc = config.funding_account_id!
        this.keyPair = KeyPair.fromString(config.funding_account_pk!)
        this.keyStore = new keyStores.InMemoryKeyStore()

        this.network = config.network

        this.keyStore.setKey(this.network, this.fundingAcc, this.keyPair)

        this.config = {
            networkId: this.network,
            keyStore: this.keyStore,
            nodeUrl: 'https://rpc.testnet.near.org',
            walletUrl: 'https://wallet.testnet.near.org',
            helperUrl: 'https://helper.testnet.near.org',
        }

        this.connection = connect(this.config)
    }

    async getConnection() {
        return this.connection
    }

    async creatorAccount() {
        const near = await connect({ ...this.config })
        return await near.account(this.fundingAcc)
    }

    /**
     * CallerAccount
     *
     * @param current_user_account account_id of the user
     * @param private_key optional parameter, passed when the caller account isnt the funding account
     * @returns current user account object
     */
    async callerAccount(current_user_account: string, private_key?: string) {
        let near = await connect({ ...this.config })

        // check if current_id is same as funding_account
        if (current_user_account != this.fundingAcc) {
            // Create keypair from the passed private_key
            this.keyPair = KeyPair.fromString(private_key!)

            // Reassign keystore with new key pair
            await this.keyStore.setKey(
                this.network,
                current_user_account,
                this.keyPair
            )

            return await near.account(current_user_account)
        }

        return await near.account(current_user_account)
    }

    /**
     * CHECK IF ACCOUNT EXISTS
     *
     * @param account_id
     * @returns boolean of whether account exists or not
     */
    async checkAccountExist(account_id: string) {
        let status

        const near = await connect({ ...this.config })

        const account = await near.account(account_id)

        await account
            .state()
            .then(() => (status = true))
            .catch(() => (status = false))

        return status
    }

    /**
     * GET ACCOUNT
     *
     * @param account_id
     * @returns A new instance of an account
     */
    async getAccount(account_id: string) {
        return new Account(this.connection, account_id)
    }
}

export const walletService = new WalletService()
