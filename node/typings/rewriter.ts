export interface InternalRoute{
  from: string
  declarer: string
  type: string
  id: string
  query?: any
  bindings?: string[]
  endDate?: string
  imagePath?: string
  imageTitle?: string
  resolveAs?: string
}