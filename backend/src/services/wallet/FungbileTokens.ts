import { BN } from 'bn.js'
import { Account, utils } from 'near-api-js'
import {
    functionCall,
    Transaction,
    Transfer,
} from 'near-api-js/lib/transaction'
import { config } from '../../config'
import { getTotalGasFee } from '../../helpers/gasPrice'
import { accountService } from './account'
import { walletService } from './wallet'
import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

type Token = {
    name: string
    symbol: string
    decimals: number
    total_supply: string
}
class FungbileTokens {
    // view function (unsigned)
    viewFunctionAccount = accountService.createAccountBasic('dontcare')

    // Storage gas in bignumber
    storageDepositGas = new BN(config.STORAGE_GAS)

    transferGas = new BN(config.FT_TRANSFER_GAS)

    // Minimum deposit amount
    storageDepositAmount = new BN(config.FT_MINIMUM_STORAGE)

    /**
     *
     * @param account_id account id of the owner of the contract, which will also act as the contract storage
     * @param token token {name, symbol, decimals and total_supply}
     */
    public async createBrandAndToken(account_id: string, token: Token) {
        account_id = account_id.endsWith('.testnet')
            ? account_id.toLocaleLowerCase()
            : `${account_id.toLocaleLowerCase()}.testnet`
        // try {
        console.log('******'.repeat(15))
        console.log('\t INITIALIZING CREATE BRAND AND BRAND TOKEN')
        console.log('******'.repeat(15))

        // Create brand account
        console.log('\t ...... Creating brand account \n')
        let _acc = await accountService.createAccount(account_id)

        if (!_acc.success) {
            throw new Error(`${_acc?.error}` || 'Error creating brand account')
        }

        console.log('\t ...... Brand account created\n')

        // assign account_id and keys to variable
        let account_info = _acc.account

        // create connection to make S.C calls
        let conn = await walletService.callerAccount(
            _acc.account?.account_id!,
            _acc.account?.private_key
        )

        console.log(
            `\t ...... Deploying Token Contract to account -> ${account_info?.account_id!} \n`
        )

        // Deploy the token contract to the newly created account_id
        let deploy_contract = await conn.deployContract(
            readFileSync(resolve(__dirname, './token_contract.wasm'))
        )

        let deploy_contract_tx = deploy_contract.transaction_outcome.id

        console.log(
            `\t ...... Initializing Token [ ${account_id} ]. To account  \n`
        )

        // Format total supply to right amount
        let total_supply = (
            parseInt(token.total_supply) * Math.pow(10, token.decimals)
        ).toString()

        // Initialize a new token
        const create_token = await conn.functionCall({
            contractId: account_id,
            methodName: 'new',
            args: {
                owner_id: account_id,
                total_supply,
                metadata: {
                    spec: 'ft-1.0.0',
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                },
            },
            gas: this.storageDepositGas,
        })

        let token_contract_id = account_id

        const create_token_tx = create_token.transaction_outcome.id

        return {
            transactions: {
                deploy_contract_tx,
                create_token_tx,
            },
            account_info,
            token_contract_id,
        }
        // } catch (error: any) {
        //     throw new Error(error)
        //     // return {
        //     //     success: false,
        //     //     msg: 'ERROR CREATING BRAND AND TOKEN',
        //     //     error,
        //     // }
        // }
    }

    /**
     * GetTokenContracts
     *
     * @param account_id
     * @returns Return a list of all tokens contract_names in an specifc account
     */
    private async getTokenContracts(account_id: string) {
        return accountService.getAccountHoldingsList(account_id)
    }

    /**
     * GetStorageBalance
     *
     * @param contract_name name of contract e.g. `eth.fakes.testnet`
     * @param account_id
     * @returns Return an object depicting the total storage balance of a specific contract
     */
    private async getStorageBalance(contract_name: string, account_id: string) {
        return await accountService.getContractBalance(
            contract_name,
            'storage_balance_of',
            account_id
        )
    }

    /**
     * GetBalanceOf
     *
     * @param contract_name
     * @param account_id
     * @returns Returns the amoun of tokens available without decimal considerations
     */
    private async getBalanceOf(contract_name: string, account_id: string) {
        try {
            return await accountService.getContractBalance(
                contract_name,
                'ft_balance_of',
                account_id
            )
        } catch (error) {
            return {
                success: false,
                msg: `getBalanceOf error: => ${error}`,
            }
        }
    }

    /**
     *
     * @param contract_name
     * @returns The metadata of a specific token {decimals, name, symbol, spec}
     */
    private async getMetadata(contract_name: string) {
        try {
            return (await this.viewFunctionAccount)!.viewFunction(
                contract_name,
                'ft_metadata'
            )
        } catch (error) {
            return {
                success: false,
                msg: `getMetadata error: => ${error}`,
            }
        }
    }

    private async getEstimatedTotalFees(
        contract_name: string,
        account_id: string
    ) {
        try {
            if (
                contract_name &&
                account_id &&
                !(await this.isStorageAvailable(contract_name, account_id))
            ) {
                let totalGasFees = await getTotalGasFee(
                    new BN(config.FT_TRANSFER_GAS)
                        .add(new BN(config.STORAGE_GAS))
                        .toString()
                )
            } else {
                return getTotalGasFee(
                    contract_name ? config.FT_TRANSFER_GAS : '450000000000'
                )
            }
        } catch (error) {
            return {
                success: false,
                msg: `getMetadata error: => ${error}`,
            }
        }
    }

    /**
     *
     * @param contract_name
     * @param account_id
     * @returns Formated balance of all tokens
     */
    async formatTokenBalance(contract_name: string, account_id: string) {
        try {
            // Get token balance
            let _balance = await this.getBalanceOf(contract_name, account_id)

            // get token metadata
            let { symbol, decimals, name, icon } = await this.getMetadata(
                contract_name
            )

            let balance = parseInt(_balance) / Math.pow(10, decimals)

            return { balance, symbol, name, icon }
        } catch (error) {
            return {
                success: false,
                msg: `formartBalance error: => ${error}`,
            }
        }
    }

    private async formatTokenAmount(contract_name: string, amount: string) {
        let { decimals } = await this.getMetadata(contract_name)

        let balance = parseInt(amount) * Math.pow(10, decimals)

        return balance
    }

    /**
     *
     * @param contract_name
     * @param account_id
     * @returns Boolean of whether or not storage exists
     */
    public async isStorageAvailable(contract_name: string, account_id: string) {
        let _balance = await this.getStorageBalance(contract_name, account_id)

        return _balance?.total !== undefined
    }

    /**
     *
     * @param account_id current user id
     * @param contract_name contract_id on which transaction
     * @param receiver_id the account_id receiving the tokens
     * @param amount number of tokens to transfer
     * @returns [tx_hash, tx_status, from, to, method_name ]
     */
    async transfer(
        account_id: string,
        contract_name: string,
        receiver_id: string,
        amount: string,
        private_key?: string
    ) {
        // Get the account object of calling account
        let account

        if (private_key) {
            account = await walletService.callerAccount(
                account_id,
                private_key!
            )
        } else {
            account = await walletService.callerAccount(account_id)
        }

        let _amount = await this.formatTokenAmount(contract_name, amount)
        // let _amount = new BN(amount)

        // Pass storage gas as big number
        let gas = new BN(this.transferGas)

        // Pass exactly 1 yoctoNear for transfer
        let min_deposit_amount = 1
        let attachedDeposit = new BN(min_deposit_amount)

        // Check if the storage is available for the current account
        let storageAvailable = await this.isStorageAvailable(
            contract_name,
            receiver_id
        )

        // If storage is not available, deposit storage
        if (!storageAvailable) {
            await account.functionCall({
                contractId: contract_name,
                methodName: 'storage_deposit',
                args: {
                    account_id: receiver_id,
                    registration_only: true,
                },
                gas: this.storageDepositGas,
                attachedDeposit: this.storageDepositAmount,
            })
        }

        try {
            let _gasFee = await this.getEstimatedTotalFees(
                contract_name,
                account_id
            )

            let gasFee = utils.format.formatNearAmount(_gasFee!.toString())

            // Transfer Tokens
            let _transfer = await account.functionCall({
                contractId: contract_name,
                methodName: 'ft_transfer',
                args: {
                    receiver_id,
                    amount: _amount.toString(),
                },
                gas,
                attachedDeposit,
            })

            return {
                hash: _transfer.transaction_outcome.id,
                status: _transfer.transaction_outcome.outcome.status,
                from: _transfer.transaction.signer_id,
                to: receiver_id,
                method: 'TRANSFER_TOKENS',
                success: true,
                estimatedGasFeeInNear: gasFee,
            }
        } catch (error) {
            return {
                error: 'Transfer Tokens Error',
                message: error,
                success: false,
            }
        }
    }
}

export const fungibleTokens = new FungbileTokens()
