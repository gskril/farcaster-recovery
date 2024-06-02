import React, { useState, useEffect } from 'react';
import { Button, Input, Typography } from '@ensdomains/thorin';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ID_REGISTRY } from '../contracts';
import { Card, CardDescription } from './atoms';
import { useFarcasterUser } from './FarcasterUserContext';

const SubmitTransferFunction = () => {
  const { address } = useAccount();
  const { signature, timestamp, toAddress, setToAddress } = useFarcasterUser();
  const [currentTimestamp, setCurrentTimestamp] = useState<string>(timestamp ? timestamp.toString() : '');
  const [currentSignature, setCurrentSignature] = useState(signature || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptStatus, setReceiptStatus] = useState<string | null>(null);

  const isAddressValid = (address: string): address is `0x${string}` => /^0x[a-fA-F0-9]{40}$/.test(address);

  const {
    writeAsync,
    data: txData,
    isLoading: txLoading,
    isSuccess: txSuccess,
    isError: txError,
    error,
  } = useContractWrite({
    ...ID_REGISTRY,
    functionName: 'transfer',
    args: [
      toAddress as `0x${string}`,
      BigInt(currentTimestamp),
      (currentSignature.startsWith('0x') ? currentSignature : `0x${currentSignature}`) as `0x${string}`,
    ],
  });

  const {
    isLoading: receiptLoading,
    isSuccess: receiptSuccess,
    isError: receiptError,
    error: receiptErrorDetails,
  } = useWaitForTransaction({
    hash: txData?.hash,
  });

  const handleSubmit = async () => {
    if (!currentSignature) {
      alert('No signature available. Please generate the signature first.');
      return;
    }

    if (!isAddressValid(toAddress)) {
      alert('Invalid Ethereum address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setReceiptStatus(null);
    try {
      await writeAsync();
      setLoading(false);
    } catch (error) {
      console.error('Transaction Error:', error);
      setErrorMessage(
        (error as Error).message ||
          'Transaction error! Please check the console for details.'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timestamp) {
      setCurrentTimestamp(timestamp.toString());
    }
    if (signature) {
      setCurrentSignature(signature);
    }
  }, [timestamp, signature]);

  useEffect(() => {
    if (receiptSuccess) {
      setReceiptStatus('Transaction confirmed!');
    } else if (receiptError) {
      if (receiptErrorDetails?.message.includes('BlockNotFoundError')) {
        setReceiptStatus('Transaction submitted, waiting for confirmation...');
      } else {
        setReceiptStatus('Transaction failed!');
      }
    }
  }, [receiptSuccess, receiptError, receiptErrorDetails]);

  return (
    <Card title="Submit Transfer Transaction">
      <CardDescription>
        Use this form to submit the transfer transaction using the previously
        generated signature signed by receiving address. Send this tx from the
        custody address.
      </CardDescription>
      <Input
        label="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="Enter 'to' address"
      />
      <Input
        label="Timestamp"
        value={currentTimestamp}
        onChange={(e) => setCurrentTimestamp(e.target.value)}
        placeholder="Enter timestamp"
      />
      <Input
        label="Signature"
        value={currentSignature}
        onChange={(e) => setCurrentSignature(e.target.value)}
        placeholder="Enter signature"
      />
      <Button
        colorStyle="purplePrimary"
        onClick={handleSubmit}
        disabled={!toAddress || txLoading || loading}
      >
        Submit Transaction
      </Button>
      {txSuccess && (
        <Typography asProp="p" style={{ color: 'green' }}>
          Transaction submitted successfully! Transaction hash: {txData?.hash}
        </Typography>
      )}
      {txError && (
        <Typography asProp="p" style={{ color: 'red' }}>
          {errorMessage}
        </Typography>
      )}
      {receiptLoading && (
        <Typography asProp="p">Waiting for transaction receipt...</Typography>
      )}
      {receiptStatus && (
        <Typography asProp="p" style={{ color: receiptStatus.includes('confirmed') ? 'green' : 'red' }}>
          {receiptStatus}
        </Typography>
      )}
    </Card>
  );
};

export default SubmitTransferFunction;
