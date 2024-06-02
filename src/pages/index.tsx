import { Heading, Helper, Spinner, Typography, mq } from '@ensdomains/thorin'
import Head from 'next/head'
import styled, { css } from 'styled-components'
import { useAccount, useContractRead, useDisconnect } from 'wagmi'
import { optimism } from 'wagmi/chains'

import { ConnectButton } from '../components/ConnectButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { UpdateRecoveryAddress } from '../components/UpdateRecoveryAddress'
import { Container, Layout } from '../components/atoms'
import { ID_REGISTRY } from '../contracts'
import { useIsMounted } from '../hooks/useIsMounted'
import GenerateTransferSignature from '../components/GenerateTransferSignature'
import GenerateMnemonic from '../components/GenerateMnemonic'
import FarcasterUserInfo from '../components/FarcasterUserInfo'
import SubmitRecoverFunction from '../components/SubmitRecoverFunction'
import SubmitTransferFunction from '../components/SubmitTransferFunction'
import {
  FarcasterUserProvider,
  useFarcasterUser,
} from '../components/FarcasterUserContext'

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

const GridContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${theme.space['4']};
    padding: ${theme.space['4']};
  `
)

const HomeContent = () => {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { fid, recoveryAddress, user, signature, timestamp } =
    useFarcasterUser()

  const { data: idOfData, isLoading: idOfLoading } = useContractRead({
    ...ID_REGISTRY,
    chainId: optimism.id,
    functionName: 'idOf',
    args: address ? [address] : undefined,
    watch: true,
    enabled: isMounted && isConnected,
  })

  return (
    <Layout>
      <Nav />

      <Container as="main">
        {address ? (
          <>
            <FarcasterUserInfo address={address} />
            {(user && user.fid) || signature ? (
              <GridContainer>
                <UpdateRecoveryAddress
                  address={address}
                  fid={user?.fid ? BigInt(user.fid) : BigInt(0)}
                />
                <GenerateMnemonic />
                <GenerateTransferSignature
                  {...(user?.fid && { fid: BigInt(user.fid) })}
                  contractAddress="0x00000000fc6c5f01fc30151999387bb99a9f489b"
                />
                <SubmitRecoverFunction />
                <SubmitTransferFunction />
              </GridContainer>
            ) : (
              <Typography color="red">
                This address does not have an FID or the FID is not yet loaded.
                Please check the connected wallet or provide a username.
              </Typography>
            )}
          </>
        ) : (
          <Wrapper>
            <Title>Manage & Recover FID Accounts</Title>
            <Description>
              Connect a wallet associated with a Farcaster ID
            </Description>

            {idOfLoading ? <Spinner /> : <ConnectButton />}
          </Wrapper>
        )}
      </Container>

      <Footer />
    </Layout>
  )
}

export default function Home() {
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

      <FarcasterUserProvider>
        <HomeContent />
      </FarcasterUserProvider>
    </>
  )
}
