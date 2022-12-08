export type ReceiptItem = {
    name: string
    count: number
    unit_price: number
    total: number
}

export type AmountSummary = {
    sub_total: number
    vat_pct: number
    vat_amount: number
    total: number
}

export type Points = {
    total_points: number
    earned_points: number
}

export interface IReceipts {
    receipt_number: string
    transaction_id: string
    account_id: string
    store_name: string
    items: ReceiptItem[]
    amount: string
    gema_points: Points
}
