import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Notification } from '../models'

export const createNotification = async (req: Request, res: Response) => {
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
        const { title, image, content } = req.body

        const notification = await Notification.create({
            title,
            image,
            content,
        })

        res.status(201).json({
            success: true,
            data: notification,
        })
    } catch (error: any) {
        console.log(error)
        res.status(400).json({
            success: false,
            msg: 'Failed to create notification',
        })
    }
}

export const fetchNotifications = async (req: Request, res: Response) => {
    try {
        let notifications = await Notification.find()

        return res.status(200).json({
            success: true,
            data: notifications,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Failed to fetch notifications',
        })
    }
}
