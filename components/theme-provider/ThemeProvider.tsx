'use client'

import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery, CssBaseline } from '@mui/material'
import { FC, ReactNode, useMemo } from 'react'

interface Props {
  children: ReactNode
}

const ThemeProvider: FC<Props> = ({ children }) => {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light'
        }
      }),
    [isDarkMode]
  )

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export default ThemeProvider
