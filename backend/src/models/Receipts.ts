import { Schema, model, Model, HydratedDocument, Types } from 'mongoose'

import { IReceipts, ReceiptItem } from '../types'

interface IReceiptMethods {}

// Describe the attributes of the Receipt Model
interface ReceiptModel extends Model<IReceipts, IReceiptMethods> {
    createReceipt(
        params: IReceipts
    ): Promise<HydratedDocument<IReceipts, IReceiptMethods>>
}

// create receipt schema
const ReceiptSchema = new Schema<IReceipts, ReceiptModel, IReceiptMethods>(
    {
        receipt_number: {
            type: String,
            required: true,
        },
        transaction_id: {
            type: String,
            required: true,
        },
        account_id: {
            type: String,
            required: true,
        },
        store_name: {
            type: String,
            required: true,
        },
        items: {
            type: [
                {
                    item_id: String,
                    name: String,
                    count: Number,
                    unit_price: Number,
                    total: Number,
                },
            ],
            default: [],
        },
        amount: {
            type: {
                sub_total: Number,
                vat_pct: Number,
                vat_amount: Number,
                total: Number,
            },
        },
        gema_points: {
            type: {
                total_points: Number,
                earned_points: Number,
            },
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

ReceiptSchema.statics.createReceipt = (params: IReceipts) => {
    return Receipt.create(params)
}

const Receipt = model<IReceipts>('Receipt', ReceiptSchema)
