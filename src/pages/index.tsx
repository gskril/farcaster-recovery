import { Heading, Helper, Spinner, Typography, mq } from '@ensdomains/thorin'
import Head from 'next/head'
import styled, { css } from 'styled-components'
import { useAccount, useContractRead, useDisconnect } from 'wagmi'

import { ConnectButton } from '../components/ConnectButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { UpdateRecoveryAddress } from '../components/UpdateRecoveryAddress'
import { Container, Layout } from '../components/atoms'
import { ID_REGISTRY } from '../contracts'
import { useIsMounted } from '../hooks/useIsMounted'

const Wrapper = styled.div(
  ({ theme }) => css`
    gap: ${theme.space['4']};
    display: flex;
    text-align: center;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  `
)

const Title = styled(Heading)`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03125rem;
  line-height: 1.1;

  ${mq.sm.min(css`
    font-size: 2.5rem;
  `)}
`

const Description = styled(Typography)(
  ({ theme }) => css`
    line-height: 1.4;
    color: ${theme.colors.grey};
    font-size: ${theme.fontSizes.large};
  `
)

export default function Home() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const idOf = useContractRead({
    ...ID_REGISTRY,
    chainId: 5,
    functionName: isMounted && isConnected ? 'idOf' : undefined,
    args: address ? [address] : undefined,
  })

  return (
    <>
      <Head>
        <title>Farcaster Account Recovery</title>
        <meta
          name="description"
          content="Easily set a recovery address for your Farcaster account"
        />

        <meta property="og:image" content="" />
        <meta property="og:title" content="Farcaster Account Recovery" />
        <meta
          property="og:description"
          content="Easily set a recovery address for your Farcaster account"
        />
      </Head>

      <Layout>
        <Nav />

        <Container as="main">
          {!!idOf.data ? (
            <UpdateRecoveryAddress fid={idOf.data} />
          ) : (
            <Wrapper>
              <Title>Set a Recovery Address for Your Farcaster Account</Title>
              <Description>
                Connect the wallet that holds your Farcaster ID
              </Description>

              {idOf.isLoading ? (
                <Spinner />
              ) : idOf.data === BigInt(0) ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                    width: '100%',
                  }}
                >
                  <Helper type="warning">
                    This address does not have an FID. Import your
                    Warpcast-provided seed phrase to a wallet app and reconnect.
                  </Helper>
                  <button
                    onClick={() => disconnect?.()}
                    style={{
                      width: 'fit-content',
                      margin: '0 auto',
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <ConnectButton />
              )}
            </Wrapper>
          )}
        </Container>

        <Footer />
      </Layout>
    </>
  )
}
