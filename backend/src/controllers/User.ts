import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { sign } from 'jsonwebtoken'
import { config } from '../config'
import { WalletType } from '../constants'
import {
    buildFilter,
    PhoneNumber,
    Password,
    randomString,
    sendSMS,
} from '../helpers'
import { User, Wallet } from '../models'
import { accountService } from '../services'

/**
 *
 * @param req.body.phone_number
 * @param req.body.password
 * @param req.body.username
 * @param req.body.email
 */
export const register = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => {
            return {
                msg: error.msg,
                field: error.param,
                success: false,
            }
        })[0]
        return res.status(400).json(_errors)
    }

    const {
        username,
        phone_number,
        email,
        subscribed,
        password,
        confirm_password,
    } = req.body

    if (password !== confirm_password) {
        return res.status(400).json({
            msg: 'Passwords do not match',
            success: false,
        })
    }

    // TODO, Check if account already onchain
    if (await User.exists({ username })) {
        return res.status(400).json({
            msg: 'Username already exists',
            success: false,
        })
    }
    if (await User.exists({ phone_number })) {
        return res.status(400).json({
            msg: 'Phone Number already exists',
            success: false,
        })
    }
    if (await User.exists({ email })) {
        return res.status(400).json({
            msg: 'Email already exists',
            success: false,
        })
    }

    // validate password
    const { error } = Password.validate(password)
    if (error) {
        return res.status(400).json({
            msg: error,
            success: false,
        })
    }

    try {
        // create near account
        let {
            success,
            account,
            msg,
            error: _error,
            hash,
            gas,
        } = await accountService.createAccount(`${username}.testnet`)

        if (!success || _error || !account) {
            // TODO: Consult george log error
            // when we can't create new user account
            // what should we do?
            return res.status(400).json({
                msg: _error || msg,
                success: false,
            })
        }

        console.log(
            `Created account ${account.public_key} at hash ${hash} and gas ${gas?.gas_used}`
        )

        // create Wallet
        let wallet = await Wallet.create({
            private_key: account.private_key,
            public_key: account.public_key,
            wallet_type: WalletType.User,
        })

        // create user
        const user = new User({
            username,
            phone_number,
            email,
            subscribed,
            password,
            wallet,
        })
        await user.save()

        const payload = {
            user: {
                id: user.id,
            },
        }
        sign(
            payload,
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_TOKEN_EXPIRES_IN,
            },
            (err, token) => {
                if (err) throw err
                res.status(200).json({ token, success: true })
            }
        )
    } catch (err: any) {
        console.error(err.message)
        return res.status(500).json({ msg: 'Internal server error' })
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => {
            return {
                msg: error.msg,
                field: error.param,
                success: false,
            }
        })[0]
        return res.status(400).json(_errors)
    }

    let {
        username,
        email,
        country,
        city,
        zip_code,
        current_password,
        new_password,
        confirm_password,
        preferred_lang,
        image,
    } = req.body

    try {
        if (!req.user)
            return res.status(401).json({ msg: 'Unauthorized', success: false })

        const user = await User.findById(req.user.id).select('password')

        if (!user) {
            return res.status(404).json({
                msg: 'User not found',
                success: false,
            })
        }

        if (current_password || new_password || confirm_password) {
            if (!current_password) {
                return res.status(400).json({
                    msg: 'Current password is required',
                    success: false,
                })
            }

            if (!(await Password.compare(user.password, current_password))) {
                return res.status(400).json({
                    msg: 'Invalid credentials',
                    success: false,
                })
            }

            if (new_password !== confirm_password) {
                return res.status(400).json({
                    msg: 'Passwords do not match',
                    success: false,
                })
            }

            // validate password
            let { error } = Password.validate(new_password)
            if (error) {
                return res.status(400).json({
                    msg: error,
                    success: false,
                })
            }
        }

        // validate username
        username = username === user.username ? '' : username

        if (username) {
            // ensure username is contains only letters and numbers
            if (!/^[a-zA-Z0-9]+$/.test(username)) {
                return res.status(400).json({
                    msg: 'Username can only contain letters and numbers',
                    success: false,
                })
            }
            if (await User.exists({ username })) {
                return res.status(400).json({
                    msg: 'Username already exists',
                    success: false,
                })
            }
        }

        // validate email
        email = email === user.email ? '' : email

        if (email) {
            if (await User.exists({ email })) {
                return res.status(400).json({
                    msg: 'Email already exists',
                    success: false,
                })
            }
        }

        // update user
        let update = buildFilter({
            username,
            email,
            country,
            city,
            zip_code,
            preferred_lang,
            password: new_password,
            image,
        })

        user.set(update)

        await user.save()

        return res.status(200).json({
            msg: 'Profile updated successfully',
            success: true,
        })
    } catch (err: any) {
        console.error(err.message)
        return res.status(400).json({
            msg: 'Internal server error',
            success: false,
        })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    const { reset_code, password, confirm_password } = req.body

    try {
        if (password !== confirm_password) {
            return res.status(400).json({
                msg: 'Passwords do not match',
                success: false,
            })
        }

        // validate password
        const { error } = Password.validate(password)
        if (error) {
            return res.status(400).json({
                msg: error,
                success: false,
            })
        }

        let user = await User.findOne({ reset_code })

        if (!user) {
            return res.status(404).json({
                msg: 'User not found',
                success: false,
            })
        }

        // update user

        user.password = password
        user.reset_code = ''

        await user.save()

        return res.status(200).json({
            msg: 'Password updated successfully',
            success: true,
        })
    } catch (err: any) {
        console.error(err)
        return res.status(400).json({
            msg: 'Failed to reset password',
            success: false,
        })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let _errors = errors.array().map((error) => ({
            msg: error.msg,
            field: error.param,
            success: false,
        }))[0]
        return res.status(400).json(_errors)
    }

    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                msg: 'User not found',
                success: false,
            })
        }

        const reset_code = randomString()

        // update user

        await user.updateOne({ reset_code })

        // send email
        // const mailOptions = {
        //     from: config.EMAIL_FROM,
        //     to: email,
        //     subject: 'Password reset',
        //     html: `
        //         <p>Please use the following link to reset your password</p>
        //         <p>${config.BASE_URL}/reset-password?code=${reset_code}</p>
        //     `,
        // }

        // await sendEmail(mailOptions)

        let to = PhoneNumber.removePlus(user.phone_number)
        sendSMS(
            to,
            `Hello ${user.username}, your Gema password reset code is ${reset_code}`
        )

        return res.status(200).json({
            msg: 'Password reset code sent successfully',
            success: true,
            data: {
                reset_code,
            },
        })
    } catch (err: any) {
        console.error(err)
        return res.status(400).json({
            msg: 'Failed to reset password',
            success: false,
        })
    }
}

/**
 * Gets a specific User By Id
 * @param id User Id
 *
 * @private
 *
 * @returns User | null
 */

export const getUserById = async (id: string) => {
    try {
        return await User.findById(id)
    } catch (err: any) {
        console.error(err.message)
        return null
    }
}
