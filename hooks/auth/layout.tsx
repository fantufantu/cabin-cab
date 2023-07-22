import { Link } from '@/components/link'
import { SxProps, Theme } from '@mui/material'
import { CSSProperties, useMemo } from 'react'

interface Navigation {
  href: string
  description: string
}

/**
 * @author murukal
 * @description 顶部导航
 */
export const useNavigations = () => {
  const navigations = useMemo<Navigation[]>(() => {
    return [
      {
        href: '/',
        description: 'Home'
      }
    ]
  }, [])

  return useMemo(() => {
    return navigations.map((navigation) => (
      <Link href={navigation.href} key={navigation.href} underline='none'>
        {navigation.description}
      </Link>
    ))
  }, [navigations])
}

/**
 * @author murukal
 * @description 样式
 */
export const useStyle = () => {
  const container = useMemo<SxProps<Theme>>(
    () => ({
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }),
    []
  )

  const main = useMemo<CSSProperties>(
    () => ({
      flex: 1
    }),
    []
  )

  return {
    container,
    main
  }
}
