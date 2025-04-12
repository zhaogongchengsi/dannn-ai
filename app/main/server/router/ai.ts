import type { AIData } from '../../../common/types'
import { createAIInput } from '../../../common/schema'
import { findAiByName, getAllAis, insertAi, updateAi } from '../../database/service/ai'
import { publicProcedure, router } from '../trpc'

export const aiRouter = router({
  createAi: publicProcedure.input(createAIInput).mutation(async ({ input }): Promise<AIData | null> => {
    const exi = await findAiByName(input.name)
    if (exi && isVersionUpgraded(exi.version, input.version)) {
      // 版本升级，处理逻辑
      return await updateAi(input.name, input)
    }

    return await insertAi({
      ...input,
      type: input.type || 'chat',
    })
  }),
  getAllAis: publicProcedure.query(async () => {
    return getAllAis()
  }),
})

/**
 * 检查版本号是否升级
 * @param oldVersion 旧版本号
 * @param newVersion 新版本号
 * @returns 如果新版本号比旧版本号高，返回 true；否则返回 false
 */
function isVersionUpgraded(oldVersion: string, newVersion: string): boolean {
  const parseVersion = (version: string) => version.split('.').map(Number)

  const [oldMajor, oldMinor, oldPatch] = parseVersion(oldVersion)
  const [newMajor, newMinor, newPatch] = parseVersion(newVersion)

  if (newMajor > oldMajor)
    return true
  if (newMajor === oldMajor && newMinor > oldMinor)
    return true
  if (newMajor === oldMajor && newMinor === oldMinor && newPatch > oldPatch)
    return true

  return false
}
