import {
  Button,
  Input,
  OutlinkSVG,
  Spinner,
  Typography,
} from '@ensdomains/thorin'
import { useState } from 'react'
import { isAddress } from 'viem'
import {
  useContractWrite,
  useEnsAddress,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi'

import { ID_REGISTRY } from '../contracts'
import useDebounce from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import { Card, CardDescription } from './atoms'

type SearchcasterResponse = {
  body: {
    id: number
    username: string
    displayName: string
    avatarUrl: string
  }
}

export function UpdateRecoveryAddress({ fid }: { fid: BigInt }) {
  const [_recoveryInput, setRecoveryInput] = useState<string>()
  const recoveryInput = useDebounce(_recoveryInput, 500)
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  // Resolve potential ENS names
  const { data: ensAddress, isLoading: ensAddressIsLoading } = useEnsAddress({
    name: recoveryInput,
    chainId: 1,
    enabled: recoveryInput?.includes('.'),
  })

  // Set the recovery address (address if provided directly or resolved address from ENS name)
  const recoveryAddress = !!recoveryInput
    ? isAddress(recoveryInput)
      ? recoveryInput
      : !!ensAddress
      ? ensAddress
      : undefined
    : undefined

  const prepareTx = usePrepareContractWrite({
    ...ID_REGISTRY,
    chainId: 5,
    functionName: !!recoveryAddress ? 'changeRecoveryAddress' : undefined,
    args: recoveryAddress ? [recoveryAddress] : undefined,
  })

  const tx = useContractWrite(prepareTx.config)
  const receipt = useWaitForTransaction({ hash: tx.data?.hash })

  const farcasterAccount = useFetch<SearchcasterResponse[]>(
    `https://searchcaster.xyz/api/profiles?fid=${fid}`
  )
  const farcasterUsername = farcasterAccount.data?.[0].body.username

  if (!farcasterAccount.data && !farcasterAccount.error) {
    return (
      <Card>
        <Spinner />
      </Card>
    )
  }

  return (
    <Card title="Set Your Recovery Address">
      <CardDescription>
        If you ever lose your Farcaster seed phrase, you&apos;ll be able to
        recover {farcasterUsername ? `@${farcasterUsername}` : `your account`}{' '}
        from this address.
      </CardDescription>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          width: '100%',
        }}
      >
        <Input
          type="text"
          hideLabel
          label="Address or ENS name"
          placeholder="Address or ENS name"
          disabled={tx.isLoading || !!tx.data}
          suffix={ensAddressIsLoading ? <Spinner /> : null}
          onChange={(e) => setRecoveryInput(e.target.value)}
        />

        {ensAddress && (
          <Typography
            fontVariant="labelHeading"
            color="textTertiary"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {recoveryAddress}
          </Typography>
        )}
      </div>

      {tx.data ? (
        <Button
          as="a"
          suffix={<OutlinkSVG />}
          loading={receipt.isLoading}
          colorStyle={receipt.isError ? 'redPrimary' : 'purplePrimary'}
          href={`https://goerli.etherscan.io/tx/${tx.data.hash}`}
          target="_blank"
        >
          {receipt.isSuccess
            ? 'Success!'
            : receipt.isError
            ? 'Transaction Failed'
            : 'Pending'}
        </Button>
      ) : chain?.id !== 5 ? (
        <Button colorStyle="purplePrimary" onClick={() => switchNetwork?.(5)}>
          Switch to Goerli
        </Button>
      ) : (
        <Button
          colorStyle="purplePrimary"
          onClick={() => tx.write?.()}
          disabled={!recoveryAddress || !tx.write || tx.isLoading}
        >
          {tx.isLoading
            ? 'Confirm in Wallet'
            : prepareTx.isError
            ? 'Error Preparing Transaction'
            : 'Set Recovery Address'}
        </Button>
      )}
    </Card>
  )
}
