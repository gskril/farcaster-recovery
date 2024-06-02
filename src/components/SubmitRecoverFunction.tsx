import React, { useState, useEffect } from 'react'
import { Button, Input, Typography } from '@ensdomains/thorin'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { ID_REGISTRY } from '../contracts'
import { Card, CardDescription } from './atoms'
import { useFarcasterUser } from './FarcasterUserContext'

const SubmitRecoverFunction = () => {
  const { address } = useAccount()
  const { user, signature, timestamp, toAddress, setToAddress } =
    useFarcasterUser()
  const [fromAddress, setFromAddress] = useState(user?.custodyAddress || '')
  const [currentTimestamp, setCurrentTimestamp] = useState(timestamp || '')
  const [currentSignature, setCurrentSignature] = useState(signature || '')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    writeAsync,
    data: txData,
    isLoading: txLoading,
    isSuccess: txSuccess,
    isError: txError,
    error,
  } = useContractWrite({
    ...ID_REGISTRY,
    functionName: 'recover',
    args: [fromAddress, toAddress, currentTimestamp, currentSignature],
  })

  const {
    isLoading: receiptLoading,
    isSuccess: receiptSuccess,
    isError: receiptError,
    error: receiptErrorDetails,
  } = useWaitForTransaction({
    hash: txData?.hash,
  })

  const handleSubmit = async () => {
    if (!currentSignature) {
      alert('No signature available. Please generate the signature first.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      await writeAsync()
      setLoading(false)
    } catch (error) {
      console.error('Transaction Error:', error)
      setErrorMessage(
        error.message ||
          'Transaction error! Please check the console for details.'
      )
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.custodyAddress) {
      setFromAddress(user.custodyAddress)
    }
    if (timestamp) {
      setCurrentTimestamp(timestamp)
    }
    if (signature) {
      setCurrentSignature(signature)
    }
  }, [user?.custodyAddress, timestamp, signature])

  return (
    <Card title="Submit Recovery Transaction">
      <CardDescription>
        Submit a recovery transaction using the previously generated signature
        signed by receiving address. Send this transaction from the recovery
        address.
      </CardDescription>
      <Input
        label="From Address"
        value={fromAddress}
        onChange={(e) => setFromAddress(e.target.value)}
        placeholder="Enter 'from' address"
      />
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
        <Typography as="p" style={{ color: 'green' }}>
          Transaction submitted successfully! Transaction hash: {txData?.hash}
        </Typography>
      )}
      {txError && (
        <Typography as="p" style={{ color: 'red' }}>
          {errorMessage}
        </Typography>
      )}
      {receiptLoading && (
        <Typography as="p">Waiting for transaction receipt...</Typography>
      )}
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
  )
}

export default SubmitRecoverFunction
