import React, { useState, useEffect } from 'react';
import { Button, Input, Typography } from '@ensdomains/thorin';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ID_REGISTRY } from '../contracts';
import { Card, CardDescription } from './atoms';
import { useFarcasterUser } from './FarcasterUserContext';

const SubmitTransferFunction = () => {
  const { address } = useAccount();
  const { signature, timestamp, toAddress, setToAddress } = useFarcasterUser();
  const [currentTimestamp, setCurrentTimestamp] = useState(timestamp || '');
  const [currentSignature, setCurrentSignature] = useState(signature || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { writeAsync, data: txData, isLoading: txLoading, isSuccess: txSuccess, isError: txError, error } = useContractWrite({
    ...ID_REGISTRY,
    functionName: 'transfer',
    args: [toAddress, currentTimestamp, currentSignature],
  });

  const { isLoading: receiptLoading, isSuccess: receiptSuccess, isError: receiptError, error: receiptErrorDetails } = useWaitForTransaction({
    hash: txData?.hash,
  });

  const handleSubmit = async () => {
    if (!currentSignature) {
      alert('No signature available. Please generate the signature first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await writeAsync();
      setLoading(false);
    } catch (error) {
      console.error('Transaction Error:', error);
      setErrorMessage(error.message || 'Transaction error! Please check the console for details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timestamp) {
      setCurrentTimestamp(timestamp);
    }
    if (signature) {
      setCurrentSignature(signature);
    }
  }, [timestamp, signature]);

  return (
    <Card title="Submit Transfer Transaction">
      <CardDescription>
        Use this form to submit the transfer transaction using the previously generated signature signed by receiving address. Send this tx from the custody address.
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
      <Button colorStyle="purplePrimary" onClick={handleSubmit} disabled={!toAddress || txLoading || loading}>
        Submit Transaction
      </Button>
      {txSuccess && (
        <Typography as="p" style={{ color: 'green' }}>
          Transaction submitted successfully! Transaction hash: {txData?.hash}
        </Typography>
      )}
      {txError && (
        <Typography as="p" style={{ color: 'red' }}>
          {errorMessage}
        </Typography>
      )}
      {receiptLoading && <Typography as="p">Waiting for transaction receipt...</Typography>}
      {receiptSuccess && (
        <Typography as="p" style={{ color: 'green' }}>
          Transaction confirmed!
        </Typography>
      )}
      {receiptError && (
        <Typography as="p" style={{ color: 'red' }}>
          {receiptErrorDetails.message || 'Transaction failed!'}
        </Typography>
      )}
    </Card>
  );
};

export default SubmitTransferFunction;
