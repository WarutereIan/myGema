import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { sign } from 'jsonwebtoken'
import { config } from '../config'
import { Password } from '../helpers'
import { User } from '../models'
import { IUser } from '../types'

/*
 * @route GET api/users/auth
 * @desc  Gets a specific user by their phone_number
 * @param req.body.phone_number Wallet phone_number
 *
 * @access private
 * @returns {User} User
 */
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.id)
        if (!user) {
            return res
                .status(404)
                .json({ msg: 'User not found', success: false })
        }
        return res.json({ user, success: true })
    } catch (err: any) {
        console.error(err.message)
        return res.status(500).send('Internal server error')
    }
}

/**
 * @route POST api/users/au Gth
 * @desc  Authenticate user and get token
 *
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0] })
    }

    const { phone_number, password } = req.body
    try {
        if (!(await User.exists({ phone_number }))) {
            // throw error if user does not exist
            return res.status(400).json({
                msg: 'User does not exist',
                success: false,
            })
        }
        const user = await User.findOne({ phone_number }).select('password')

        if (!user || !(await Password.compare(user.password, password))) {
            return res
                .status(400)
                .json({ msg: 'Invalid credentials', success: false })
        }

        // login user
        const payload = {
            id: user.id,
            phone_number: user.phone_number,
        }
        sign(
            payload,
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_TOKEN_EXPIRES_IN,
            },
            (err, token) => {
                if (err) throw err
                res.json({ token, success: true })
            }
        )
    } catch (err: any) {
        console.error(err.message)
        return res.status(500).send('Internal server error')
    }
}
