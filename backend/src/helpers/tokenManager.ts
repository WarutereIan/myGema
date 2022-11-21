import { accountService, fungibleTokens } from '../services'
import { fiatManager } from './fiatManager'

class TokenManager {
    /**
     *
     * @param account_id current account_id
     * @returns Token information
     *
     * @notice any token contract with 'ref-finance-101.testnet' should be ignored
     */
    async getAllAccountTokens(account_id: string) {
        try {
            let tokens = await accountService.getAccountHoldingsList(account_id)
            if (tokens) {
                return Promise.all(
                    tokens.map(async (token: string) => {
                        let _token = await fungibleTokens.formatTokenBalance(
                            token,
                            account_id
                        )

                        const usd_price =
                            await fiatManager.fetchRefFinanceTokenInfo(token)

                        return {
                            token: token,
                            name: _token.name,
                            symbol: _token.symbol,
                            value: _token.balance,
                            price_usd: usd_price?.price,
                            image: _token.icon,
                        }
                    })
                )
            } else {
                console.log('NETWORK ERROR')
            }
        } catch (error) {
            return {
                success: false,
                msg: `getAllAccountTokens error: => \n ${error}`,
            }
        }
    }
}

export const tokenManager = new TokenManager()
