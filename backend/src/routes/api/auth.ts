import { Router } from 'express'
import { check } from 'express-validator'
import { validateToken } from '../../middlewares'
import {
    login,
    getCurrentUser,
    register,
    resetPassword,
    forgotPassword,
} from '../../controllers'

const router = Router()

router.get('/', validateToken, getCurrentUser)

router.post(
    '/login',
    [
        check('phone_number', 'Phone Number is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
    ],
    login
)
router.post(
    '/register',
    [
        check('phone_number', 'Phone Number is required')
            .not()
            .isEmpty()
            .trim(),
        check('password')
            .isStrongPassword({
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Password must be greater than 6 and contain at least one uppercase letter, one lowercase letter, one number and one special character'
            ),
        check('confirm_password')
            .isStrongPassword({
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Confirm password must be greater than 6 and contain at least one uppercase letter, one lowercase letter, one number and one special character'
            ),

        check('username', 'Username is required')
            .not()
            .isEmpty()
            .trim()
            .escape()
            .custom((value) => {
                // ensure that username contains only letters and numbers
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                    throw new Error(
                        'Username must contain only letters and numbers'
                    )
                }
                return true
            }),
        check('email')
            .isEmail()
            .withMessage('Email is invalid')
            .normalizeEmail(),
    ],
    register
)

router.post(
    '/reset-password',
    [
        check('password')
            .isStrongPassword({
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Password must be greater than 6 and contain at least one uppercase letter, one lowercase letter, and one number'
            ),
        check('confirm_password')
            .isStrongPassword({
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Confirm password must be greater than 6 and contain at least one uppercase letter, one lowercase letter, and one number'
            ),

        check('reset_code', 'Password reset code is required').not().isEmpty(),
    ],
    resetPassword
)

router.post(
    '/forgot-password',
    [check('email', 'Email is required').not().isEmpty().normalizeEmail()],
    forgotPassword
)

module.exports = router
