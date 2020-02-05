import { VBase } from '@vtex/api'
import { RedirectInput, RedirectTypes } from 'vtex.rewriter'

import { RewriterGraphql } from '../clients/rewriterGraphql'

const INDEX = 'INDEX'
const REVERSE_INDEX = 'ID_TO_URL'

const toReverseIndexKey = (id: string, binding: string) => `${id}__${binding}`
// TODO receives multiple bindings
export class IdUrlIndex {
  private bucket: string
  constructor(
    protected vbase: VBase,
    protected rewriterGraphql: RewriterGraphql
  ) {
    this.bucket = `_${INDEX}_${REVERSE_INDEX}`
  }

  public get = async (id: string, binding: string) => {
    const key = toReverseIndexKey(id, binding)
    const response = await this.vbase.getJSON<string>(this.bucket, key, true)
    return response
  }

  public save = async (id: string, binding: string, url: string) => {
    const canonical = await this.get(id, binding)
    if (canonical && canonical !== url) {
      const { id: canonicalId } = (await this.rewriterGraphql.getInternal(
        url
      )) || { id: null }
      if (canonicalId !== id) {
        const redirect: RedirectInput = {
          bindings: [binding],
          from: canonical,
          to: url,
          // endDate TODO ONE YEAR???
          type: RedirectTypes.Temporary,
        }
        await this.rewriterGraphql.saveRedirect(redirect)
      }
    }
    const key = toReverseIndexKey(id, binding)
    const response = await this.vbase.saveJSON<string>(this.bucket, key, url)
    return response
  }
}
