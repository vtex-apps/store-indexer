import { VBase } from '@vtex/api'
import { RedirectInput } from 'vtex.rewriter'

import { RewriterGraphql } from '../clients/rewriterGraphql'
import { OneYearFromNow } from '../utils/dates'

const INDEX = 'INDEX'
const REVERSE_INDEX = 'ID_TO_URL'

const REDIRECT_ORIGIN = 'vtex.store-indexer@0.x:redirect'

const toReverseIndexKey = (id: string, bindings: string[]) =>
  `${id}__${bindings.join('_')}`

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

  public save = async (id: string, url: string, bindings: string[] = ['*']) => {
    const canonical = (await this.get(id, bindings)) as string | null
    if (canonical && canonical !== url) {
      const { id: canonicalId } = (await this.rewriterGraphql.getInternal(
        url
      )) ?? { id: null }
      if (canonicalId !== id) {
        const redirect: RedirectInput = {
          bindings,
          endDate: OneYearFromNow(),
          from: canonical,
          origin: REDIRECT_ORIGIN,
          to: url,
          type: 'TEMPORARY',
        }
        await this.rewriterGraphql.saveRedirect(redirect)
      }
    }
    const key = toReverseIndexKey(id, bindings)
    const response = await this.vbase.saveJSON<string>(this.bucket, key, url)
    return response
  }
}
