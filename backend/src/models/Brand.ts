import { Schema, model, Model, HydratedDocument, Types } from 'mongoose'

import { IBrand } from '../types'

interface IBrandMethods {}
// An interface that describes what attributes a Brand model should have
interface BrandModel extends Model<IBrand, IBrandMethods> {
    createBrand(
        params: IBrand
    ): Promise<HydratedDocument<IBrand, IBrandMethods>>
}

// Creating Brand schema
const BrandSchema = new Schema<IBrand, BrandModel, IBrandMethods>(
    {
        name: {
            type: String,
            required: true,
        },

        valueStaked: {
            type: Number,
            required: true,
        },
        token: {
            type: Types.ObjectId,
            ref: 'Token',
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

BrandSchema.statics.createBrand = (params: IBrand) => {
    return Brand.create(params)
}

BrandSchema.pre(/^find/, function (next) {
    this.populate({ path: 'token' })

    next()
})

// Creating Brand model
const Brand = model<IBrand>('Brand', BrandSchema)

export { Brand }
