import { Card as ThorinCard, Typography } from '@ensdomains/thorin'
import styled, { css } from 'styled-components'

import { mq } from '../styles/breakpoints'

export const Layout = styled.div`
  // Vertically centered layout
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  gap: 3rem;

  width: 100%;
  padding: 2rem;
  min-height: 100svh;

  @media ${mq.sm.max} {
    padding: 1rem;
  }
`

export const Container = styled.div`
  width: 100%;
  max-width: 35rem;
  margin-left: auto;
  margin-right: auto;
`

export const Card = styled(ThorinCard)(
  ({ theme }) => css`
    align-items: center;
    max-width: ${theme.space['112']};
    margin: 0 auto;
  `
)

export const CardDescription = styled(Typography).attrs({
  asProp: 'p',
  color: 'grey',
})(
  ({ theme }) => css`
    line-height: 1.4;
    text-align: center;

    code {
      font-size: 0.9375rem;
      letter-spacing: -0.0625rem;
      padding: 0.0625rem 0.25rem;
      background-color: ${theme.colors.greySurface};
    }
  `
)
