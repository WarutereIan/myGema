import 'dotenv/config'
import * as dev from './environment/development'

/// @dev Validate required environment variables
if (
    !process.env.MONGO_URI ||
    !process.env.JWT_SECRET ||
    !process.env.ADVANTA_API_KEY ||
    !process.env.ADVANTA_PARTNER_ID ||
    !process.env.ADVANTA_SHORTCODE
) {
    throw new Error(
        'Please make sure you have a MONGO_URI, JWT_SECRET and ADVANTA_API_KEY, ADVANTA_PARTNER_ID, ADVANTA_SHORTCODE in your .env file'
    )
}

export const config = {
    /**
     * @notice Database configuration
     */
    MONGO_URI: process.env.MONGO_URI!,

    /**
     * @notice Server configuration
     * @dev This is the port that the server will be running
     */
    PORT: process.env.PORT,

    /**
     * @notice JWT configuration
     * @dev This is the secret key that will be used to sign the JWT
     */
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_TOKEN_EXPIRES_IN: 3600000 * 24 * 7, // 7 days

    /**
     * ADVANTA SMS API CONFIGURATION
     */
    ADVANTA_API_KEY: process.env.ADVANTA_API_KEY!,
    ADVANTA_PARTNER_ID: process.env.ADVANTA_PARTNER_ID!,
    ADVANTA_SHORTCODE: process.env.ADVANTA_SHORTCODE!,

    indexer_url: dev.default.INDEXER_SERVICE_URL,
    funding_account_pk: process.env['PK']!,
    funding_account_id: process.env['ACC_ID']!,
    network: 'testnet',
    min_balance_for_create: dev.default.MIN_BALANCE_FOR_CREATE,
    base_balance_for_create: dev.default.BASE_BALANCE_FOR_CREATE,
    provider_url: dev.default.PROVIDER_URL,
    STORAGE_GAS: dev.default.FT_STORAGE_DEPOSIT_GAS,
    FT_MINIMUM_STORAGE: dev.default.FT_MINIMUM_STORAGE_BALANCE,
    ft_minimum_storage_large: dev.default.FT_MINIMUM_STORAGE_BALANCE_LARGE,
    REF_FINANCE_API_ENDPOINT: dev.default.REF_FINANCE_API_ENDPOINT,
    REF_FINANCE_CONTRACT: dev.default.REF_FINANCE_CONTRACT,
    FT_TRANSFER_GAS: process.env.FT_TRANSFER_GAS || '15000000000000',
}
