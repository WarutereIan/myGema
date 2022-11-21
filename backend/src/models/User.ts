import { Schema, model, Model, HydratedDocument, Types } from 'mongoose'

import { IUser } from '../types'
import { Password } from '../helpers'

interface IUserMethods {
    fullName: () => string
}
// An interface that describes what attributes a user model should have
interface UserModel extends Model<IUser> {
    createUser(params: IUser): Promise<HydratedDocument<IUser, IUserMethods>>
}

// Creating user schema
const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        reset_code: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        zip_code: {
            type: String,
            required: false,
        },
        favorite: {
            type: [Types.ObjectId],
            default: [],
        },
        wallet: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        preferred_lang: {
            type: String,
            default: 'en',
        },
        subscribed: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
                delete ret.password
                delete ret.reset_code
                delete ret.wallet.private_key
                delete ret.wallet.id
                delete ret.wallet.createdAt
                delete ret.wallet.updatedAt
            },
            versionKey: false,
        },
        timestamps: true,
    }
)

// Methods
UserSchema.methods.fullName = function () {
    return this.username
}
// Statics
UserSchema.statics.createUser = (params: IUser) => {
    return User.create(params)
}

// Hooks
UserSchema.pre('save', async function (done) {
    // encrypt password
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)
    }
    done()
})

UserSchema.pre(/^find/, function (next) {
    this.populate({ path: 'wallet' })

    next()
})

// Creating user model
const User = model<IUser>('User', UserSchema)

export { User }
