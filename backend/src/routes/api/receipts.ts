import { Router } from 'express'
import { check } from 'express-validator'
import { createNewReceipt, getReceipts } from '../../controllers'

const router = Router()

router.post(
    '/new',
    [
        check('store_name', 'Store Name is required').not().isEmpty(),
        check('items', 'Items Object').not().isEmpty(),
        check('account_id', 'user account ID is required').not().isEmpty(),
    ],
    createNewReceipt
)

router.get('/', getReceipts)

module.exports = router
