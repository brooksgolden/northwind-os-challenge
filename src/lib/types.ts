export type InquiryStatus = 'new' | 'contacted' | 'qualified' | 'closed'

export interface Inquiry {
  id: string
  cafe_name: string
  contact_name: string
  email: string
  region: string
  channel: string
  requested_volume_lbs_month: number
  message: string
  received_date: string
  status: InquiryStatus
}

export interface Sale {
  date: string
  region: string
  sku: string
  product: string
  units_lbs: number
  revenue: number
}

export interface Account {
  id: string
  name: string
  region: string
  monthly_volume_lbs: number
  customer_since: string
  status: 'active' | 'paused'
}
