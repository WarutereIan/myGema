import { Router } from 'express'
import { validateToken } from '../../middlewares'
import {
    fetchTokens,
    updateProfile,
    fetchTransactions,
    sendTokens,
} from '../../controllers'
import { check } from 'express-validator'

const router = Router()

router.post('/update', validateToken, updateProfile)

router.post(
    '/tokens',
    validateToken,
    [check('username', 'Username is required').not().isEmpty()],
    fetchTokens
)
router.post(
    '/transactions',
    validateToken,
    [check('username', 'Username is required').not().isEmpty()],
    fetchTransactions
)

router.post(
    '/send',
    validateToken,
    [
        check('token', 'Token address is required').not().isEmpty(),
        check('receiver', 'Receiver address  is required').not().isEmpty(),
        check('amount')
            .not()
            .isEmpty()
            .withMessage('Amount is required')
            .isNumeric()
            .withMessage('Amount must be a number')
            //make sure amount is greater than 0
            .custom((value) => {
                if (parseFloat(value) <= 0) {
                    throw new Error('Amount must be greater than 0')
                }
                return true
            }),
    ],
    sendTokens
)

module.exports = router
