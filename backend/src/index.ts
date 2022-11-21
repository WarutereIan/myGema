import { accountManager } from './helpers/accountManager'
import { fiatManager } from './helpers/fiatManager'
import { getLatestBlock, getLatestGasPrice } from './helpers/gasPrice'
import { tokenManager } from './helpers/tokenManager'
import { transactionManager } from './helpers/transactionManager'
import { accountService } from './services/wallet/account'
import { fungibleTokens } from './services/wallet/FungbileTokens'
import { walletService } from './services/wallet/wallet'

const test = async () => {
    // const wlt = await walletService.checkAccountExist('gematest.testnet')
    const acc = await accountService.createAccount('wota1z.testnet')
    console.log(acc)
    // const ft = await fungibleTokens.isStorageAvailable(
    //     'wazitofc5.testnet',
    //     'wazitofc5.testnet'
    // )
    // const ft = await fungibleTokens.transfer(
    //     'gematest.testnet',
    //     'i3pumba.testnet',
    //     'newton1.testnet',
    //     '100'
    // )
    // console.log(ft)
    // const ft = await fungibleTokens.transfer(
    //     'i3pumba.testnet',
    //     'i3pumba.testnet',
    //     'gematest.testnet',
    //     '1000',
    //     'ed25519:3jZ9AWvN3gbhCUVQgYHoPWvX6QjRbmwde4dx9Lw8PDgoPn3U3AdLcZHcNntSjnWVouLLCjP91cPZ7CuBTs89N3wC'
    // )
    // console.log(ft)
    // const ft1 = await accountService.getAccountHoldingsList('iamwoyez.testnet')
    // console.log(ft1)
    // const t1 = await fungibleTokens.formatTokenBalance(
    //     'contract.gematest.testnet',
    //     '0715081.testnet'
    // )
    // const md = await fungibleTokens.getMetadata('contract.gematest.testnet')
    // console.log(md)
    // console.log(ft)
    // console.log(ft1)
    // const price = await fiatManager.fetchRefFinanceTokenInfo(
    //     'eth.fakes.testnet'
    // )
    // console.log(price)
    // const tokens = await transactionManager.getAllAccountTranscations(
    //     'gematest.testnet'
    // )
    // console.log(tokens)
    // const gas = await getLatestGasPrice()
    // console.log(gas)
    // let deploy_token = await accountManager.createBrandWithToken(
    //     '9uipumba.testnet', // ACcount ID = Name of brand
    //     '9uiPUMBA TOKEN', // Token name
    //     'LM1', // SYMBOY
    //     8,
    //     '1000000000'
    // )
    // console.log(deploy_token)
    // let a = await walletService.checkAccountExist('wazitofc.testnet')
    // console.log(a)
}

test()
