import { validationResult } from 'express-validator'
import { Receipt } from '../models'
import { Request, Response } from 'express'

export const getReceipts = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    // TODO: Add an Admin guard

    try {
        let receipt = await Receipt.find()

        return res.status(200).json({
            success: true,
            data: receipt,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to fetch receipts',
        })
    }
}

//TODO: Make it specific to user
export const createNewReceipt = async (req: Request, res: Response) => {
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
        // TODO: Auto generate receipt_number, tx_id
        //TODO: calculate points

        let {
            receipt_number,
            transaction_id,
            account_id,
            store_name,
            items,
            gema_points,
        } = req.body

        let amount = items.reduce(
            (acc: any, curr: any) => acc + curr.unit_price * curr.count,
            0
        )

        let _receipt = await Receipt.create({
            receipt_number,
            transaction_id,
            account_id,
            store_name,
            items,
            amount,
            gema_points,
        })

        let receipt = await Receipt.findById(_receipt.id)

        return res.status(200).json({ success: true, data: receipt })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to Create Reciepts',
        })
    }
}
