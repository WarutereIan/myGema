import { fungibleTokens } from '../services'

class AccountManager {
    public async createBrandWithToken(
        account_id: string,
        token_name: string,
        token_symbol: string,
        token_decimals: number,
        total_supply: string
    ) {
        console.log({
            account_id,
            token_name,
            token_symbol,
            token_decimals,
            total_supply,
        })
        // try {
        return await fungibleTokens.createBrandAndToken(account_id, {
            name: token_name,
            symbol: token_symbol,
            decimals: token_decimals,
            total_supply,
        })
        // } catch (error) {
        //     return error
        // }
    }
}

export const accountManager = new AccountManager()
