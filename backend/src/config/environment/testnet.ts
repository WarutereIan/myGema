import { utils } from 'near-api-js'

export default {
    INDEXER_SERVICE_URL: 'https://testnet-api.kitwallet.app',
    MIN_BALANCE_FOR_GAS: utils.format.parseNearAmount('0.05'),
    MIN_BALANCE_FOR_CREATE: utils.format.parseNearAmount('1'),
    REF_FINANCE_API_ENDPOINT: 'https://testnet-indexer.ref-finance.com/',
    REF_FINANCE_CONTRACT: 'ref-finance-101.testnet',
}
