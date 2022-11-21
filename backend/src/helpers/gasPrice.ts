import BN from 'bn.js'
import { accountService, walletService } from '../services'

export const getLatestBlock = async () => {
    let connection = await accountService.getConnection()

    return connection?.provider.block({ finality: 'final' })
}

export const getLatestGasPrice = async () => {
    let latestBlock = await getLatestBlock()

    return latestBlock?.header.gas_price
}

export const getTotalGasFee = async (gas: any) => {
    let latestGasPrice = await getLatestGasPrice()

    return new BN(`${latestGasPrice}`).mul(new BN(gas)).toString()
}

export const formatTGasToYoctoNEAR = (tGas: number) =>
    new BN(tGas * 10 ** 12).toString()
