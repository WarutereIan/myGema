import { Schema, model, Model, HydratedDocument } from 'mongoose'

import { INotification } from '../types'

interface INotificationMethods {}
// An interface that describes what attributes a Notification model should have
interface NotificationModel extends Model<INotification, INotificationMethods> {
    createNotification(
        params: INotification
    ): Promise<HydratedDocument<INotification, INotificationMethods>>
}

// Creating Notification schema
const NotificationSchema = new Schema<
    INotification,
    NotificationModel,
    INotificationMethods
>(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(_, ret) {
                ret.id = ret._id
                delete ret._id
            },
            versionKey: false,
        },
        timestamps: true,
    }
)

// Statics
NotificationSchema.statics.createNotification = (params: INotification) => {
    return Notification.create(params)
}

// Creating Notification model
const Notification = model<INotification>('Notification', NotificationSchema)

export { Notification }
