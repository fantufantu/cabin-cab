import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system/styleFunctionSx'

/**
 * @author murukal
 * @description sx props 类型不能直接用于 use callback，增加类型支持
 */
export type CallableSx = (theme: Theme) => SystemStyleObject<Theme>
