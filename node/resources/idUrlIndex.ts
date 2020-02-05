import { VBase } from '@vtex/api'
import { RedirectInput, RedirectTypes } from 'vtex.rewriter'

import { RewriterGraphql } from '../clients/rewriterGraphql'

const INDEX = 'INDEX'
const REVERSE_INDEX = 'ID_TO_URL'

const tenMinutesFromNowMS = () =>
  `${new Date(Date.now() + 10 * 60 * 1000)}`

const toReverseIndexKey = (id: string, bindings: string[]) =>
  `${id}__${bindings.join('_')}`
// TODO receives multiple bindings
export class IdUrlIndex {
  private bucket: string
  constructor(
    protected vbase: VBase,
    protected rewriterGraphql: RewriterGraphql
  ) {
    this.bucket = `_${INDEX}_${REVERSE_INDEX}`
  }

  public get = async (id: string, bindings: string[]) => {
    const key = toReverseIndexKey(id, bindings)
    const response = await this.vbase.getJSON<string>(this.bucket, key, true)
    return response
  }

  public save = async (id: string, bindings: string[], url: string) => {
    const canonical = (await this.get(id, bindings)) as string | null
    if (canonical && canonical !== url) {
      const { id: canonicalId } = (await this.rewriterGraphql.getInternal(
        url
      )) || { id: null }
      if (canonicalId !== id) {
        const redirect: RedirectInput = {
          bindings,
          endDate: tenMinutesFromNowMS(),
          from: canonical,
          to: url,
          type: RedirectTypes.Temporary,
        }
        await this.rewriterGraphql.saveRedirect(redirect)
      }
    }
    const key = toReverseIndexKey(id, bindings)
    const response = await this.vbase.saveJSON<string>(this.bucket, key, url)
    return response
  }
}
