'use client'

import { Box, Button, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'

/**
 * @author murukal
 * @description 登录页面
 */
const Login = () => {
  const { control } = useForm()

  return (
    <Box className='h-full flex flex-row'>
      <Box className='flex-1 flex flex-col justify-center'>
        <Typography variant='h4'>Sign in to</Typography>
        <Typography className='mt-2 font-semibold' variant='h3'>
          番土星球
        </Typography>
      </Box>

      <Box className='flex-1' />

      {/* 登录表单 */}
      <Box className='flex-1 flex flex-col justify-center'>
        <form>
          <TextField placeholder='邮箱' fullWidth />
          <TextField className='mt-6' placeholder='密码' fullWidth type='password' />

          <Button fullWidth className='mt-6'>
            登 录
          </Button>
        </form>
      </Box>
    </Box>
  )
}

export default Login
