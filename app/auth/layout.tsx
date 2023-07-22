import { AppBar, Box, Container, Toolbar } from '@mui/material'
import { FC, ReactNode } from 'react'
import { useNavigations, useStyle } from '@/hooks/auth/layout'

interface Props {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  const navigations = useNavigations()
  const style = useStyle()

  return (
    <Container sx={style.container}>
      <AppBar color='transparent' elevation={0} position='static'>
        <Toolbar disableGutters>
          <Box flex={1} display='flex' justifyContent='space-between'>
            {navigations}
          </Box>

          <Box flex={2}></Box>
        </Toolbar>
      </AppBar>

      <main style={style.main}>{children}</main>
    </Container>
  )
}

export default Layout
