import { CallableSx } from '@/types/mui'
import { useCallback } from 'react'

/**
 * @author murukal
 * @description 样式
 */
export const useStyle = () => {
  /// 容器
  const container = useCallback<CallableSx>(() => {
    return {
      backgroundImage: `linear-gradient(
                  270deg,
                  rgba(176, 42, 42, .16) 0%,
                  rgba(176, 42, 42, .56) 18.45%,
                  rgba(176, 42, 42, .8) 49.67%,
                  rgba(176, 42, 42, .56) 82.52%,
                  rgba(176, 42, 42, .196364) 99.7%,
                  rgba(189, 40, 40, 0) 99.71%,
                  rgba(203, 56, 55, 0) 99.72%,
                  rgba(203, 56, 55, .16) 99.73%
                )`
    }
  }, [])

  return {
    container
  }
}
