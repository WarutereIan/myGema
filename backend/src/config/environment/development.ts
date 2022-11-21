import { utils } from 'near-api-js'

export default {
    INDEXER_SERVICE_URL: 'https://testnet-api.kitwallet.app',
    MIN_BALANCE_FOR_GAS: utils.format.parseNearAmount('0.05'),
    MIN_BALANCE_FOR_CREATE: utils.format.parseNearAmount('0.1'),
    BASE_BALANCE_FOR_CREATE: utils.format.parseNearAmount('5'),
    REF_FINANCE_API_ENDPOINT: 'https://testnet-indexer.ref-finance.com/',
    REF_FINANCE_CONTRACT: 'ref-finance-101.testnet',
    PROVIDER_URL: 'https://rpc.testnet.near.org',
    FT_STORAGE_DEPOSIT_GAS: '30000000000000',
    FT_MINIMUM_STORAGE_BALANCE: '1250000000000000000000',
    FT_MINIMUM_STORAGE_BALANCE_LARGE: '12500000000000000000000',
}
