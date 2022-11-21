import { Router } from 'express'
import { validateToken } from '../../middlewares'
import { createNotification, fetchNotifications } from '../../controllers'
import { check } from 'express-validator'

const router = Router()

router.get('/', fetchNotifications)
router.post(
    '/new',
    validateToken,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('image', 'Image is required').not().isEmpty(),
        check('content', 'Content is required').not().isEmpty(),
    ],
    createNotification
)

module.exports = router
