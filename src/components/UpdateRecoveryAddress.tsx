import {
  Button,
  Helper,
  Input,
  OutlinkSVG,
  Spinner,
  Typography,
} from '@ensdomains/thorin';
import { useState } from 'react';
import { Address, isAddress } from 'viem';
import {
  useContractRead,
  useContractWrite,
  useEnsAddress,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi';
import { optimism } from 'wagmi/chains';

import { ID_REGISTRY } from '../contracts';
import useDebounce from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { truncateAddress } from '../utils';
import { Card, CardDescription } from './atoms';
import { useFarcasterUser } from './FarcasterUserContext';

type ApiResponse = {
  user: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    verified: boolean;
  };
}

type Props = { address: Address; fid: bigint };

export function UpdateRecoveryAddress({ address, fid }: Props) {
  const { user } = useFarcasterUser();
  const [_recoveryInput, setRecoveryInput] = useState<string>();
  const recoveryInput = useDebounce(_recoveryInput, 500);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  // Resolve potential ENS names
  const { data: ensAddress, isLoading: ensAddressIsLoading } = useEnsAddress({
    name: recoveryInput,
    chainId: 1,
    enabled: recoveryInput?.includes('.'),
  });

  const recoveryAddress = !!recoveryInput
    ? isAddress(recoveryInput)
      ? recoveryInput
      : !!ensAddress
      ? ensAddress
      : undefined
    : undefined;

  // Get the current recovery address
  const { data: currentRecoveryAddress } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'recoveryOf',
    args: [fid],
  });

  const prepareTx = usePrepareContractWrite({
    ...ID_REGISTRY,
    chainId: optimism.id,
    functionName: !!recoveryAddress ? 'changeRecoveryAddress' : undefined,
    args: recoveryAddress ? [recoveryAddress] : undefined,
  });

  const tx = useContractWrite(prepareTx.config);
  const receipt = useWaitForTransaction({ hash: tx.data?.hash });

  const farcasterAccount = useFetch<ApiResponse>(
    `/api/user-by-custody?custody_address=${address}`
  );

  const farcasterUsername = user?.username || farcasterAccount.data?.user.username;

  if (!farcasterAccount.data && !farcasterAccount.error) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
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
          disabled={!recoveryAddress || !tx.write || tx.isLoading}
        >
          {tx.isLoading
            ? 'Confirm in Wallet'
            : prepareTx.isError
            ? 'Error Preparing Transaction'
            : 'Set Recovery Address'}
        </Button>
      )}
      {
  currentRecoveryAddress && !tx.data && (
          <Helper>
            Your current recovery address is{' '}
            {truncateAddress(currentRecoveryAddress)}
          </Helper>
        )}


    </Card>
  );
}
