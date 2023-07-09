import styled from 'styled-components'

import { ConnectButton } from './ConnectButton'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`

const Title = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
`

export function Nav() {
  return (
    <Wrapper>
      <Title>FID Manager</Title>
      <ConnectButton size="small" />
    </Wrapper>
  )
}
