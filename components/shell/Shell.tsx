import { FC, ReactNode } from 'react'
import { AppBar, Box } from '@mui/material'
import clsx from 'clsx'

interface Props {
  children: ReactNode
}

/**
 * @author murukal
 * @description 在这里构建整个应用的框架，大致分为 左侧导航 + 顶部导航
 */
const Shell: FC<Props> = ({ children }) => {
  return (
    <Box
      className={clsx([
        // 布局样式
        'flex flex-row',
        // 容器定位
        'h-full'
      ])}
    >
      {/* 左侧导航 */}
      <Box className={clsx(['w-64'])}></Box>

      {/* 右侧布局 */}
      <Box
        className={clsx([
          // 在父元素内的布局样式
          'flex-1',
          // 布局样式
          'flex flex-col'
        ])}
      >
        {/* 顶部导航 */}
        <AppBar></AppBar>

        {/* 正文内容 */}
        <main className={clsx(['h-full p-5'])}>{children}</main>
      </Box>
    </Box>
  )
}

export default Shell
