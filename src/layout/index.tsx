import { useTheme } from 'musae'
import Navigations from '../components/navigations'
import { type ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme()

  return (
    <div
      className='w-screen h-screen flex'
      style={{
        // @ts-expect-error style vars
        '--surface-container-low': colors['surface-container-low'],
        '--on-primary': colors['on-primary']
      }}
    >
      <Navigations />
      <main
        className='flex-1 py-10 px-8'
        style={{
          backgroundColor: 'var(--surface-container-low)'
        }}
      >
        {children}
      </main>
    </div>
  )
}

export default Layout
