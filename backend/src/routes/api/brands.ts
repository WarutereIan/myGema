import { Router } from 'express'
import { validateToken } from '../../middlewares'
import { createNewBrand, fetchBrands } from '../../controllers'
import { check } from 'express-validator'

const router = Router()

router.get('/', fetchBrands)
router.post(
    '/new',
    validateToken,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('symbol', 'Symbol is required').not().isEmpty(),
        check('decimals', 'Decimals is required')
            .not()
            .isEmpty()
            .isInt({ min: 1, max: 11 })
            .withMessage('Decimals must be between 1 and 11'),
        check('totalSupply', 'Total Supply is required')
            .not()
            .isEmpty()
            .isNumeric()
            .withMessage('Total Supply must be a number'),
        check('valueStaked', 'Value Staked is required')
            .not()
            .isEmpty()
            .isNumeric()
            .withMessage('Value Staked must be a number'),
        check('image', 'Image is required').not().isEmpty(),
    ],
    createNewBrand
)

module.exports = router
