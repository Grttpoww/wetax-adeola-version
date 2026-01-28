import { Lens } from 'monocle-ts'
import { FormFields } from '../../../components/form/Form'
import { ScanResponse, TaxReturnData, ScanResponseBankkonto } from '../../../openapi'
import { ScreenEnum, ScreenTypeEnum } from './enums'

export type FormObj<T> = {
  fields: FormFields<T>
}

export type FormArray<T> = {
  fields: FormFields<T>
}

const lens = Lens.fromProp<TaxReturnData>()

export type TaxReturnDataKey = Parameters<typeof lens>[0]

export type ScreenArrayForm<K extends TaxReturnDataKey, U extends {}> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ArrayForm
  helpText?: string
  text?: string
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  dataKey: K
  getLabel: (v: U) => string
  form: FormArray<U>
  overviewScreen: ScreenEnum
}

export type ScreenObjForm<K extends TaxReturnDataKey> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ObjForm
  helpText?: string
  text?: string
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  dataKey: K
  form: FormObj<TaxReturnData[K]['data']>
}

export type ScreenYesNo<K extends TaxReturnDataKey> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.YesNo
  helpText?: string
  text?: string
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  dataKey: K
  question: string

  yesScreen?: ScreenEnum
  noScreen?: ScreenEnum
  update?: (res: TaxReturnData[K], data: TaxReturnData) => TaxReturnData
}

export type ScreenArrayOverview<K extends TaxReturnDataKey, U extends {}> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ArrayOverview
  helpText?: string
  text?: string
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  dataKey: K
  getLabel: (v: U) => string
  getSublabel?: (v: U) => string
  detailScreen: ScreenEnum
  maxItems?: number
}

export type ScreenScanOrUploadObj<K extends TaxReturnDataKey> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ScanOrUploadObj
  helpText?: string
  text?: string

  dataKey: K
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  updateItem: (v: ScanResponse, data: TaxReturnData) => TaxReturnData[K]['data']
  update?: (v: ScanResponse, data: TaxReturnData) => TaxReturnData
}

export type ScreenScanOrUploadArray<K extends TaxReturnDataKey, U extends {}> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ScanOrUploadArray
  helpText?: string
  text?: string

  dataKey: K
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  updateItem: (v: ScanResponse, data: TaxReturnData) => U
  update?: (v: ScanResponse, data: TaxReturnData) => TaxReturnData
}

export type ScreenScanOrUploadArrayBankkonto<K extends TaxReturnDataKey, U extends {}> = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.ScanOrUploadArrayBankkonto
  helpText?: string
  text?: string

  dataKey: K
  isDone: (v: TaxReturnData[K], data: TaxReturnData) => boolean
  hide?: (v: TaxReturnData[K], data: TaxReturnData) => boolean

  updateItem: (v: ScanResponseBankkonto, data: TaxReturnData) => U
  update?: (v: ScanResponseBankkonto, data: TaxReturnData) => TaxReturnData
}

export type ScreenCategory = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.CategoryOverview
  helpText?: string

  text?: string
  isDone?: (v: any, allData?: TaxReturnData) => boolean
}

export type GeneratePdf = {
  name: ScreenEnum
  title: string
  type: ScreenTypeEnum.GeneratePdf
  helpText?: string
}

export type ScreenT<K extends TaxReturnDataKey, U extends {} = any> =
  | ScreenYesNo<K>
  | ScreenArrayForm<K, U>
  | ScreenCategory
  | ScreenObjForm<K>
  | ScreenArrayOverview<K, U>
  | ScreenScanOrUploadObj<K>
  | ScreenScanOrUploadArray<K, U>
  | ScreenScanOrUploadArrayBankkonto<K, U>
  | GeneratePdf

export type DataDefaults = {
  [K in keyof TaxReturnData]: TaxReturnData[K]['data'] extends Array<unknown>
  ? TaxReturnData[K]['data'][0]
  : TaxReturnData[K]['data']
}
