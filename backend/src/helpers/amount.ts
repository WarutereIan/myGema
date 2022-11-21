import Big from 'big.js'

const APPROX_ZERO_MIN = '10'

export const toNear = (value = '0') =>
    Big(value)
        .times(10 ** 24)
        .toFixed()
export const nearTo = (value = '0', to = 2) =>
    Big(value)
        .div(10 ** 24)
        .toFixed(to === 0 ? undefined : to)
export const big = (value = '0') => Big(value)
export const gtZero = (value = '0') => big(value).gt(big())
export const gtZeroApprox = (value = '0') => big(value).gt(big(APPROX_ZERO_MIN))

export const formatTokenAmount = (value: any, decimals = 18, precision = 2) =>
    value && Big(value).div(Big(10).pow(decimals)).toFixed(precision)
export const parseTokenAmount = (value: any, decimals = 18) =>
    value && Big(value).times(Big(10).pow(decimals)).toFixed()
export const removeTrailingZeros = (amount: any) => amount.replace(/\.?0*$/, '')
