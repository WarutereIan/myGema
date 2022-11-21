import { Schema, model, Model, HydratedDocument, Types } from 'mongoose'

import { IToken } from '../types'

interface ITokenMethods {}
// An interface that describes what attributes a Token model should have
interface TokenModel extends Model<IToken, ITokenMethods> {
    createToken(
        params: IToken
    ): Promise<HydratedDocument<IToken, ITokenMethods>>
}

// Creating Token schema
const TokenSchema = new Schema<IToken, TokenModel, ITokenMethods>(
    {
        name: {
            type: String,
            required: true,
        },

        symbol: {
            type: String,
            required: true,
        },
        decimals: {
            type: Number,
            required: true,
        },
        totalSupply: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
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

TokenSchema.statics.createToken = (params: IToken) => {
    return Token.create(params)
}

// Creating Token model
const Token = model<IToken>('Token', TokenSchema)

export { Token }
