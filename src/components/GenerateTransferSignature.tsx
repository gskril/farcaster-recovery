import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Input, Typography } from '@ensdomains/thorin';
import { useAccount, useContractRead } from 'wagmi';
import { ID_REGISTRY } from '../contracts';
import { Card, CardDescription } from './atoms';
import { useFarcasterUser } from './FarcasterUserContext';

const GenerateTransferSignature = ({ contractAddress }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const { address, isConnected } = useAccount();
  const { signature, setSignature, setTimestamp, timestamp, toAddress, setToAddress, fid: userFid } = useFarcasterUser();
  const [fid, setFid] = useState(userFid);

  useEffect(() => {
    setFid(userFid);
  }, [userFid]);

  const isAddressValid = toAddress && /^0x[a-fA-F0-9]{40}$/.test(toAddress);

  const { data: nonceData, isLoading: nonceLoading } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'nonces',
    args: [toAddress],
    enabled: isAddressValid,
  });

  const domain = {
    name: 'Farcaster IdRegistry',
    version: '1',
    chainId: 10, // make sure this matches your network's chain ID
    verifyingContract: contractAddress,
  };

  const types = {
    Transfer: [
      { name: 'fid', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const deadline = timestamp || Math.floor(Date.now() / 1000) + 31536000; // 1 year from now
  const deadlineDate = new Date(deadline * 1000).toLocaleString(); // Convert to human-readable format

  const value = {
    fid: parseInt(fid),
    to: toAddress,
    nonce: parseInt(nonceData?.toString() || '0'),
    deadline,
  };

  const handleSign = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not available.');
      return;
    }
    if (!isConnected) {
      alert('Please connect your wallet.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum); // Using ethers v6+
    const signer = await provider.getSigner();

    try {
      await provider.send("eth_requestAccounts", []); // Request account access
      const signature = await signer.signTypedData(domain, types, value);
      console.log('Signature:', signature);
      setSignature(signature);
      setTimestamp(deadline);
      setCopyStatus(''); // Reset copy status
    } catch (error) {
      console.error('Error signing data:', error);
      alert(`Failed to sign data: ${error.message}`);
    }
  };

  const serializeBigInt = (key, value) => {
    return typeof value === 'bigint' ? value.toString() : value;
  };

  const toggleDetails = () => setShowDetails(!showDetails);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(`${label} copied!`);
      setTimeout(() => setCopyStatus(''), 2000); // Clear the copied status after 2 seconds
    });
  };

  return (
    <Card title="Generate EIP-712 Transfer Signature">
      <CardDescription>
        Create & sign an EIP-712 message for transferring FID to another address using the receiving `To` address for the signature.
      </CardDescription>
      <Typography as="p" style={{ fontSize: '0.8rem', color: 'gray' }}>
        Deadline (1 year from now): {deadlineDate} (UNIX: {deadline})
      </Typography>
      <Input
        label="FID"
        value={fid}
        onChange={(e) => setFid(e.target.value)}
        placeholder="Enter FID"
      />
      <Input
        label="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="Enter 'to' address"
        disabled={nonceLoading}
      />
      <Input
        label="Nonce"
        value={value.nonce}
        onChange={(e) => setNonce(e.target.value)}
        placeholder="Enter nonce"
      />
      <Input
        label="Deadline"
        value={deadline}
        onChange={(e) => setTimestamp(parseInt(e.target.value))}
        placeholder="Enter deadline"
      />
      <Button colorStyle="purplePrimary" onClick={handleSign} disabled={!toAddress || !isAddressValid || nonceLoading}>
        Generate Signature
      </Button>
      {showDetails && (
        <div>
          <Typography as="p" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {JSON.stringify({ domain, types, value }, serializeBigInt, 2)}
          </Typography>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <Button colorStyle="purplePrimary" onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</Button>
        {showDetails && (
          <Button
          colorStyle="purplePrimary" onClick={() => copyToClipboard(JSON.stringify({ domain, types, value }, serializeBigInt, 2), 'JSON')}
          >
            Copy JSON
          </Button>
        )}
      </div>
      {signature && (
        <div>
          <Typography as="p" style={{ wordWrap: 'break-word', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Signature: 
          </Typography>
          <Input
            value={signature}
            readOnly
            onClick={() => copyToClipboard(signature, 'EIP-712 signature')}
            style={{ cursor: 'pointer', wordBreak: 'break-all', fontSize: '0.8rem' }}
          />
          {copyStatus && <Typography as="p" style={{ color: '#0070f3' }}>{copyStatus}</Typography>}
        </div>
      )}
    </Card>
  );
};

export default GenerateTransferSignature;
