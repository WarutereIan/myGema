import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Brand, Token } from '../models'
import { accountManager } from '../helpers'

export const fetchBrands = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    try {
        let brands = await Brand.find()

        return res.status(200).json({
            success: true,
            data: brands,
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to fetch brands',
        })
    }
}

export const createNewBrand = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    let { name, symbol, decimals, totalSupply, valueStaked, image } = req.body

    try {
        // remove whitespaces
        let account_id = name.toLowerCase().replace(/\s/g, '')

        let brandWithToken = await accountManager.createBrandWithToken(
            account_id,
            name,
            symbol,
            decimals,
            totalSupply
        )

        let token = await Token.create({
            name,
            symbol,
            decimals,
            totalSupply,
            address: brandWithToken.token_contract_id,
            image,
        })

        let brand = await Brand.create({
            name,
            token,
            valueStaked,
        })

        return res.status(200).json({
            success: true,
            data: brand,
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to create brand',
        })
    }
}
