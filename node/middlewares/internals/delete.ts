/* eslint-disable no-console */
import { LINKED } from '@vtex/api'

import { Rewriter } from '../../clients/rewriter'

export const deleteOldTranslation = async (
  id: string,
  type: string,
  bindingId: string,
  rewriter: Rewriter
) => {
  const routesById = await rewriter.routesById({ id, type })
  const oldPath = routesById.find(({ binding }) => binding === bindingId)

  if (!oldPath) {
    return
  }
  await rewriter.deleteInternal({ from: oldPath.route, binding: bindingId })

  if (LINKED) {
    console.log('Deleted', { from: oldPath.route, binding: bindingId })
  }
}
