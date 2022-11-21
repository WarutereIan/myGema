import axios from 'axios'
import BN from 'bn.js'
import {
    keyStores,
    connect,
    KeyPair,
    Connection,
    utils,
    Account,
    InMemorySigner,
} from 'near-api-js'
import { JsonRpcProvider } from 'near-api-js/lib/providers'
import { config } from '../../config'
import { walletService } from './wallet'

class AccountsService {
    keyStore: keyStores.InMemoryKeyStore
    keypair: KeyPair
    network: string
    minCreateBalance: string
    provideURL: string
    indexerServiceURL: string

    public constructor() {
        // Define the keystore without value
        this.keyStore = new keyStores.InMemoryKeyStore()

        // create secret and public key from a random ed25519 format
        this.keypair = KeyPair.fromRandom('ed25519')

        // Set newtork => mainnet / testnet / local
        this.network = config.network

        // Get min balance for create
        this.minCreateBalance = config.base_balance_for_create!

        this.provideURL = config.provider_url!
        this.indexerServiceURL = config.indexer_url!
    }

    /**
     * CREATE ACCOUNT
     *
     * @param account_id new unique account_id being createdd
     * @returns tx_hash, status, account_info and gas used
     */
    async createAccount(account_id: string) {
        try {
            account_id = account_id.endsWith('.testnet')
                ? account_id.toLocaleLowerCase()
                : `${account_id.toLocaleLowerCase()}.testnet`

            // get public and private keys from keypair
            let public_key = this.keypair.getPublicKey().toString()
            let private_key = this.keypair.toString()

            // add keys to inMemoryKeystore
            await this.keyStore.setKey(this.network, account_id, this.keypair)

            // Pass create account gas
            let gas = new BN('30000000000000')
            let gas_in_near = utils.format.formatNearAmount(gas.toString())

            // Get the minimum amount to pass when creating an account
            let min_create_amount = this.minCreateBalance
            let attachedDeposit = new BN(min_create_amount)

            // Check if account exists
            let account_exist = await walletService.checkAccountExist(
                account_id
            )

            // Return error if account already exists
            if (account_exist)
                return {
                    msg: 'Account Id already exists. Try another one.',
                    success: false,
                }

            // get the creator account
            let creator_acc = await walletService.creatorAccount()

            // Call create_account method to create account
            let _account = await creator_acc.functionCall({
                contractId: this.network,
                methodName: 'create_account',
                args: {
                    new_account_id: account_id,
                    new_public_key: public_key,
                },
                gas,
                attachedDeposit,
            })

            return {
                hash: _account.transaction_outcome.id,
                status: _account.transaction_outcome.outcome.status,
                account: {
                    account_id,
                    public_key,
                    private_key,
                },
                gas: {
                    gas_attached: gas_in_near,
                    gas_used: utils.format.formatNearAmount(
                        `${_account.transaction_outcome.outcome.gas_burnt}`
                    ),
                },
                success: true,
            }
        } catch (error) {
            return {
                succcess: false,
                msg: `Near testnet create account error`,
                error,
            }
        }
    }

    public async createSubAccount(
        account_id: string,
        sub_account: string,
        private_key: string
    ) {
        let account = await walletService.callerAccount(account_id, private_key)

        // TODO: parseAsYoctoNear unit

        let initAmount = new BN(config.ft_minimum_storage_large)

        return await account.createAccount(
            sub_account,
            this.keypair.getPublicKey(),
            initAmount
        )
    }

    /**
     * INTERNAL FN -> _createConnection
     *
     * @returns connection object
     */
    private async _createConnection() {
        try {
            //Create a provider and a signer
            let signer = new InMemorySigner(this.keyStore)
            let provider = new JsonRpcProvider({
                url: this.provideURL,
            })

            return Connection.fromConfig({
                networkId: this.network,
                provider,
                signer,
            })
        } catch (error) {
            console.error(`createConnection ERROR: -> ${error}`)
        }
    }

    async getConnection() {
        return await this._createConnection()
    }

    /**
     * CREATE BASIC ACCOUNT
     *
     * @param account_id pass account_id to create a view or change account.
     *                  (for view account, use 'dontcare', for change account, use a valid accaount id)
     * @returns account object used to make view or change class
     */
    async createAccountBasic(account_id: string) {
        try {
            let connection = await this._createConnection()

            return new Account(connection!, account_id)
        } catch (error) {
            console.error(`createAccountBasic \n ERROR: -> ${error}`)
        }
    }

    /**
     * GET CONTRACT BALANCE
     *
     * @param contract_id contract you want to get balance of
     * @param method_name ['storage_balance_of' or 'ft_balance_of' or more]
     * @param account_id account id calling this
     * @returns  balance of a contract in yoctoNear
     */
    async getContractBalance(
        contract_id: string,
        method_name: string,
        account_id: string
    ) {
        // Use create basic to execute a  view function thus passing dontcare as a parameter
        return await (await this.createAccountBasic('dontcare'))!.viewFunction(
            contract_id,
            method_name,
            { account_id }
        )
    }

    /**
     * GET ACCOUNT HOLDINGS LIST
     *
     * Get all the tokens held in an account
     *
     * @param account_id -> the account_id of the account to get tokens from
     *                      e.g -> accountone.testnet
     * @returns a list of tokens in the account
     *          e.g -> ['contract.gematest.testnet','usdc.fakes.testnet','usdt.fakes.testnet']
     */
    async getAccountHoldingsList(account_id: string) {
        try {
            let url = `${this.indexerServiceURL}/account/${account_id}/likelyTokensFromBlock`

            let response = await axios({
                method: 'get',
                url,
            })

            return response.data['list']
        } catch (error) {
            return {
                error: 'getAccountHoldings error',
                msg: error,
                success: false,
            }
        }
    }

    /**
     * GET ACCOUNT TX
     *
     * Get all the transaction from an account
     *
     * @param account_id Account to get transactions for
     * @returns a transaction object
     *          - tx_hash : the transaction hash
     *          - timestamp : block timestamp of the transaction
     *          - from : the signer_id
     *          - to: the receivers account id
     *          - args: other info in the tx -> [gas, amount, method called, ]
     */
    async getAccountTransactions(account_id: string) {
        try {
            let url = `${this.indexerServiceURL}/account/${account_id}/activity`

            let response = await axios({
                method: 'get',
                url,
            })

            let transactions = response.data.map((tx: any) => {
                return {
                    hash: tx['hash'],
                    timestamp: tx['block_timestamp'],
                    from: tx['signer_id'],
                    to: tx['receiver_id'],
                    method_name: tx['args']['method_name'],
                    tx_type: tx['action_kind'],
                    args: tx['args'],
                }
            })

            return transactions
        } catch (error) {
            return {
                error: 'getAccountTransactions error',
                msg: error,
                success: false,
            }
        }
    }
}

export const accountService = new AccountsService()
