import { Button, Profile, mq } from '@ensdomains/thorin'
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit'
import styled, { css } from 'styled-components'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'

const StyledButton = styled(Button)(
  ({ theme, size }) => css`
    ${size === 'small'
      ? css`
          max-width: fit-content;
        `
      : css`
          max-width: ${theme.space['32']};

          ${mq.xs.min(css`
            max-width: ${theme.space['45']};
          `)}
        `}
  `
)

const sharedStyles = css`
  width: fit-content;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
      cursor: pointer;
    }
  }
`

const ProfileMedium = styled(Profile)`
  ${sharedStyles}

  ${mq.sm.min(css`
    max-width: 15rem;
  `)}

  ${mq.xs.max(css`
    display: none;
  `)}
`

const ProfileMobile = styled(Profile)`
  ${sharedStyles}

  ${mq.xs.min(css`
    display: none;
  `)}
`

export function ConnectButton({ size }: { size?: 'small' }) {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address, chainId: 1 })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName })
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  if (address) {
    return (
      <>
        <ProfileMedium
          address={address}
          ensName={ensName || undefined}
          avatar={ensAvatar || undefined}
          onClick={openAccountModal}
        />
        <ProfileMobile
          address={address}
          ensName={ensName || undefined}
          avatar={ensAvatar || undefined}
          size="small"
          onClick={openAccountModal}
        />
      </>
    )
  }

  return (
    <StyledButton
      size={size}
      colorStyle="purplePrimary"
      onClick={() => openConnectModal?.()}
    >
      Connect Wallet
    </StyledButton>
  )
}
