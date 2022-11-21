import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { textSpanContainsPosition } from 'typescript'
import { tokenManager } from '../helpers/tokenManager'
import { transactionManager } from '../helpers/transactionManager'
import { User } from '../models'
import { fungibleTokens } from '../services'

export const fetchTokens = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    let { username } = req.body

    try {
        if (!username) {
            return res.status(400).json({
                success: false,
                msg: 'Username is required',
            })
        }

        let tokens = await tokenManager.getAllAccountTokens(
            `${username}.testnet`
        )

        return res.status(200).json({
            success: true,
            data: tokens,
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to fetch tokens',
        })
    }
}

export const fetchTransactions = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    let { username } = req.body

    try {
        if (!username) {
            return res.status(400).json({
                success: false,
                msg: 'Username is required',
            })
        }

        let transactions = await transactionManager.getAllAccountTranscations(
            `${username}.testnet`
        )

        return res.status(200).json({
            success: true,
            data: transactions,
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Failed to fetch transactions',
        })
    }
}

export const sendTokens = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    let { token, receiver, amount } = req.body

    try {
        let sender = await User.findOne({ _id: req?.user?.id }).select(
            'username wallet'
        )

        if (!sender) {
            return res.status(400).json({
                success: false,
                msg: 'User not found',
            })
        }

        // validate receiver
        let receiverAccount = await User.findOne({
            $or: [{ username: receiver }],
        }).select('username -wallet')

        if (!receiverAccount) {
            return res.status(400).json({
                success: false,
                msg: 'Receiver not found',
            })
        }

        let account_id = `${sender.username}.testnet`

        let receiver_account_id = `${receiverAccount.username}.testnet`

        let private_key = sender.wallet.private_key

        // decode private key

        let tx = await fungibleTokens.transfer(
            account_id,
            token,
            receiver_account_id,
            amount,
            private_key
        )

        return res.status(200).json({
            success: true,
            data: tx,
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: `Failed to send ${amount} ${token} to ${receiver}`,
        })
    }
}
