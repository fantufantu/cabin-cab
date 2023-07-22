'use client'

import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { Link as MuiLink, LinkProps as MuiLinkProps, styled } from '@mui/material'
import { AnchorHTMLAttributes, forwardRef } from 'react'

const Anchor = styled('a')({})

interface NextLinkComposedProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<NextLinkProps, 'href' | 'as' | 'passHref' | 'onMouseEnter' | 'onClick' | 'onTouchStart'> {
  to: NextLinkProps['href']
}

const NextLinkComposed = forwardRef<HTMLAnchorElement, NextLinkComposedProps>(function NextLinkComposed(props, ref) {
  const { to, replace, scroll, shallow, prefetch, legacyBehavior = true, locale, ...other } = props

  return (
    <NextLink
      href={to}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref
      locale={locale}
      legacyBehavior={legacyBehavior}
    >
      <Anchor ref={ref} {...other} />
    </NextLink>
  )
})

type LinkProps = {
  href: NextLinkProps['href']
} & Omit<NextLinkComposedProps, 'to' | 'href'> &
  Omit<MuiLinkProps, 'href'>

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    className: classNameProps,
    href,
    legacyBehavior,
    locale,
    prefetch,
    replace,
    role,
    scroll,
    shallow,
    ...other
  } = props

  const isExternal = typeof href === 'string' && (href.indexOf('http') === 0 || href.indexOf('mailto:') === 0)

  if (isExternal) {
    return <MuiLink href={href} ref={ref} {...other} />
  }

  const nextLinkProps: NextLinkComposedProps = {
    to: href,
    replace,
    scroll,
    shallow,
    prefetch,
    legacyBehavior,
    locale
  }

  return <MuiLink component={NextLinkComposed} ref={ref} {...nextLinkProps} {...other} />
})

export default Link
