/* eslint-disable no-console */
import { Binding, LINKED } from '@vtex/api'
import { pick } from 'ramda'
import { InternalInput } from 'vtex.rewriter'

import { Context } from '../../typings/global'

const mergeBindingsToInternals = (
  bindings: Binding[],
  internals: InternalInput[]
) =>
  internals.map(internal => {
    const binding = bindings.find(b => b.id === internal.binding)
    return {
      ...internal,
      binding: pick(['id', 'defaultLocale', 'canonicalBaseAddress'], binding),
    }
  })

export async function saveInternals(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { rewriter },
    state: { internals, tenantInfo },
  } = ctx
  if (internals) {
    if (LINKED) {
      const tenant = pick(['id', 'defaultLocale'], tenantInfo)
      console.log(
        JSON.stringify(
          {
            internals: mergeBindingsToInternals(tenantInfo.bindings, internals),
            tenant,
          },
          null,
          2
        )
      )
    }
    await rewriter.saveManyInternals(internals)
  }

  await next()
}
