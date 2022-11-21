import { config } from '../config'
import DataLoader from 'dataloader'
import axios from 'axios'

class FiatManager {
    refFinanceDataLoader
    account: string
    constructor() {
        this.account = config.network

        this.refFinanceDataLoader = async () => {
            try {
                const refFinanceTokenFiatValues = await axios({
                    method: 'get',
                    url: `${config.REF_FINANCE_API_ENDPOINT}/list-token-price`,
                })

                return refFinanceTokenFiatValues.data
            } catch (error) {
                console.error(`Failed to fetch ref-finance prices: ${error}`)
                return Promise.resolve([{}])
            }
        }
    }

    async fetchRefFinanceTokenInfo(token_contract: string) {
        try {
            const prices: Record<string, { price: string }> =
                await this.refFinanceDataLoader()

            let msg
            for (const [key, value] of Object.entries(prices)) {
                if (key == token_contract) {
                    msg = {
                        success: true,
                        msg: 'Fetched token info. (price in dollars)',
                        price: value.price,
                    }
                }
            }

            return msg
        } catch (error) {
            return {
                success: false,
                msg: `getAllAccountTokens error: => \n ${error}`,
            }
        }
    }
}

export const fiatManager = new FiatManager()
