import { accountService } from '../services'

class TransactionManager {
    /**
     * GET ALL TRANSACTIONS IN AN ACCOUNT
     *
     * @param account_id user account ID
     * @returns all user account transactions
     */
    async getAllAccountTranscations(account_id: string) {
        try {
            return await accountService.getAccountTransactions(account_id)
        } catch (error) {
            return {
                success: false,
                msg: `getAllAccountTokens error: => \n ${error}`,
            }
        }
    }
}

export const transactionManager = new TransactionManager()
