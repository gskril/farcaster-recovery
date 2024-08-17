import {
  Button,
  Helper,
  Input,
  OutlinkSVG,
  RecordItem,
  Skeleton,
} from '@ensdomains/thorin'
import { useState } from 'react'
import { Address } from 'viem'
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi'
import { optimism } from 'wagmi/chains'

import { ID_REGISTRY } from '../contracts'
import useDebounce from '../hooks/useDebounce'
import { usePrepareTransfer } from '../hooks/usePrepareTransfer'
import { Card, CardDescription } from './atoms'

type Props = { address: Address; fid: bigint }

export function TransferFid({ address, fid }: Props) {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const [_fidToTransfer, setFidToTransfer] = useState(fid)
  const fidToTransfer = useDebounce(_fidToTransfer, 500)

  const transferData = usePrepareTransfer({ fid: fidToTransfer })
  const { mnemonic, newCustodyAddress } = transferData.data || {}

  const { data: ownerOfFid } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'custodyOf',
    args: [fidToTransfer],
  })

  const { data: recovererOfFid } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'recoveryOf',
    args: [fidToTransfer],
  })

  const prepareTx = usePrepareContractWrite({
    ...ID_REGISTRY,
    chainId: optimism.id,
    functionName: fidToTransfer === fid ? 'transfer' : 'recover',
    // @ts-expect-error - wagmi doesn't like the conditional args here but it works
    args: transferData.data
      ? fidToTransfer === fid
        ? [
            transferData.data.newCustodyAddress,
            transferData.data.deadline,
            transferData.data.signature,
          ]
        : [
            ownerOfFid, // The address to transfer the fid from, aka current owner of the fid
            transferData.data.newCustodyAddress,
            transferData.data.deadline,
            transferData.data.signature,
          ]
      : undefined,
  })

  const tx = useContractWrite(prepareTx.config)
  const receipt = useWaitForTransaction({ hash: tx.data?.hash })
  const canRecover = ownerOfFid === address || recovererOfFid === address

  return (
    <Card title="Transfer Your FID">
      <CardDescription>
        Move your Farcaster account to a fresh wallet with the following seed
        phrase.
      </CardDescription>

      {canRecover && (
        <Skeleton loading={transferData.isLoading}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
              width: '100%',
            }}
          >
            <RecordItem value={mnemonic || ''}>
              {mnemonic ||
                'test test test test test test test test test test test test'}
            </RecordItem>
          </div>
        </Skeleton>
      )}

      <Input
        defaultValue={fid?.toString()}
        label="FID to transfer/recover"
        onChange={(e) => {
          // Test for fid to be a number
          if (!/^\d+$/.test(e.target.value)) {
            return alert('Please enter a valid number')
          }

          setFidToTransfer(BigInt(e.target.value))
        }}
      />

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
      ) : !canRecover ? (
        <Button disabled>You can&apos;t transfer this FID</Button>
      ) : (
        <Button
          colorStyle="purplePrimary"
          onClick={() => tx.write?.()}
          disabled={
            !newCustodyAddress ||
            !tx.write ||
            tx.isLoading ||
            !ownerOfFid ||
            !prepareTx.data
          }
        >
          {tx.isLoading
            ? 'Confirm in Wallet'
            : prepareTx.isError
            ? 'Error Preparing Transaction'
            : 'Transfer FID'}
        </Button>
      )}

      {canRecover && (
        <Helper type="warning">
          Store this seed phrase in a secure place. You will need it to login to
          Warpcast. This website does not store your seed phrase so it cannot be
          recovered.
        </Helper>
      )}
    </Card>
  )
}
