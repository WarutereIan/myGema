import { Schema, model, Model, HydratedDocument } from 'mongoose'

import { WalletType } from '../constants'
import { IWallet } from '../types'

interface IWalletMethods {
    address: () => string
}
// An interface that describes what attributes a Wallet model should have
interface WalletModel extends Model<IWallet> {
    createWallet(
        params: IWallet
    ): Promise<HydratedDocument<IWallet, IWalletMethods>>
}

// Creating Wallet schema
const WalletSchema = new Schema<IWallet, WalletModel, IWalletMethods>(
    {
        public_key: {
            type: String,
            required: true,
        },
        private_key: {
            type: String,
            required: true,
        },
        wallet_type: {
            type: String,
            required: true,
            default: WalletType.User,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
            },
            versionKey: false,
        },
        timestamps: true,
    }
)

// Methods
WalletSchema.methods.address = function () {
    return this.public_key
}
// Statics
WalletSchema.statics.createWallet = (params: IWallet) => {
    return Wallet.create(params)
}

// Hooks
WalletSchema.pre('save', async function (done) {
    // encrypt private key
    if (this.isModified('private_key')) {
        // encrypt private key
        // const hashed = await Wallet.toHash(this.get('private_key'))
        this.set('private_key', this.get('private_key'))
    }
    done()
})

// Creating Wallet model
const Wallet = model<IWallet>('Wallet', WalletSchema)

export { Wallet }
