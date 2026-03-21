// ── Payment method lookup ──────────────────────────────────────

export const PAYMENT_METHODS = [
  { value: 'cash',     label: '💵 Tiền mặt' },
  { value: 'transfer', label: '🏦 Chuyển khoản' },
  { value: 'momo',     label: '🟣 Momo' },
  { value: 'card',     label: '💳 Thẻ' },
] as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:     'Tiền mặt',
  transfer: 'Chuyển khoản',
  momo:     'Momo',
  card:     'Thẻ',
}

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  recurring: 'Khoản lặp lại',
  fixed:     'Chi phí cố định',
  manual:    'Thủ công',
}
