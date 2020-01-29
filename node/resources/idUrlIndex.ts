import { VBase } from '@vtex/api'

const INDEX = 'INDEX'
const REVERSE_INDEX = 'ID_TO_URL'

const toReverseIndexKey = (id: string, binding: string) => `${id}__${binding}`

export class IdUrlIndex {
  private bucket: string
  constructor(protected vbase: VBase) {
    this.bucket = `_${INDEX}_${REVERSE_INDEX}`
  }

  // Additional methods for indexing of URLs by their corresponding ID in VTEX catalog.
  public get = async (id: string, binding: string) => {
    const key = toReverseIndexKey(id, binding)
    const response = await this.vbase.getJSON<string>(this.bucket, key, true)
    return response
  }

  public save = async (id: string, binding: string, url: string) => {
    const key = toReverseIndexKey(id, binding)
    const response = await this.vbase.saveJSON<string>(this.bucket, key, url)
    return response
  }
}
