import { RouteLocator } from 'vtex.rewriter'

import { Rewriter } from '../clients/rewriter'

export const deleteOldTranslation = async (
  id: string,
  type: string,
  bindingId: string,
  rewriter: Rewriter
): Promise<RouteLocator | null> => {
  const routesById = await rewriter.routesById({ id, type })
  const oldPath = routesById.find(({ binding }) => binding === bindingId)

  if (!oldPath) {
    return null
  }
  return { from: oldPath.route, binding: bindingId }
}
