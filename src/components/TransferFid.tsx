import {
  Button,
  Helper,
  Input,
  OutlinkSVG,
  RecordItem,
  Spinner,
  Typography,
} from '@ensdomains/thorin'
import { useState } from 'react'
import { Address, isAddress } from 'viem'
import {
  useContractRead,
  useContractWrite,
  useEnsAddress,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi'
import { optimism } from 'wagmi/chains'

import { ID_REGISTRY } from '../contracts'
import useDebounce from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import { usePrepareTransfer } from '../hooks/usePrepareTransfer'
import { truncateAddress } from '../utils'
import { Card, CardDescription } from './atoms'

type Props = { address: Address; fid: bigint }

export function TransferFid({ address, fid }: Props) {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const transferData = usePrepareTransfer({ fid })
  const { mnemonic, newCustodyAddress, deadline, signature } =
    transferData.data || {}

  // Get the current custody address
  const { data: currentCustodyAddress } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'custodyOf',
    args: [fid],
  })

  const prepareTx = usePrepareContractWrite({
    ...ID_REGISTRY,
    chainId: optimism.id,
    functionName: !!newCustodyAddress ? 'transfer' : undefined,
    args: transferData.data
      ? [
          transferData.data.newCustodyAddress,
          transferData.data.deadline,
          transferData.data.signature,
        ]
      : undefined,
  })

  const tx = useContractWrite(prepareTx.config)
  const receipt = useWaitForTransaction({ hash: tx.data?.hash })

  const farcasterAccount = useFetch<{ username?: string }>(
    `/api/user-by-fid?fid=${fid}`
  )
  const farcasterUsername = farcasterAccount.data?.username || undefined

  if (!farcasterAccount.data && !farcasterAccount.error) {
    return (
      <Card>
        <Spinner />
      </Card>
    )
  }

  return (
    <Card title="Transfer Your FID">
      <CardDescription>
        Move{' '}
        {farcasterUsername
          ? `@${farcasterUsername}`
          : `your account (FID #${fid.toString()})`}{' '}
        to a fresh wallet with the following seed phrase.
      </CardDescription>

      {mnemonic && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            width: '100%',
          }}
        >
          <RecordItem value={mnemonic}>{mnemonic}</RecordItem>
        </div>
      )}

      {tx.data ? (
        <Button
          as="a"
          suffix={<OutlinkSVG />}
          loading={receipt.isLoading}
          colorStyle={receipt.isError ? 'redPrimary' : 'purplePrimary'}
          href={`https://optimistic.etherscan.io/tx/${tx.data.hash}`}
          target="_blank"
        >
          {receipt.isSuccess
            ? 'Success!'
            : receipt.isError
            ? 'Transaction Failed'
            : 'Pending'}
        </Button>
      ) : chain?.unsupported ? (
        <Button
          colorStyle="purplePrimary"
          onClick={() => switchNetwork?.(optimism.id)}
        >
          Switch to OP Mainnet
        </Button>
      ) : (
        <Button
          colorStyle="purplePrimary"
          onClick={() => tx.write?.()}
          disabled={!newCustodyAddress || !tx.write || tx.isLoading}
        >
          {tx.isLoading
            ? 'Confirm in Wallet'
            : prepareTx.isError
            ? 'Error Preparing Transaction'
            : 'Transfer FID'}
        </Button>
      )}

      {!!mnemonic && (
        <Helper type="warning">
          Store this seed phrase in a secure place. You will need it to login to
          Warpcast. This website does not store your seed phrase so it cannot be
          recovered.
        </Helper>
      )}
    </Card>
  )
}
