import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Button, Typography } from '@ensdomains/thorin'
import { Card, CardDescription } from './atoms'

const GenerateMnemonic = () => {
  const [walletInfo, setWalletInfo] = useState<{
    mnemonic: string
    address: string
    privateKey: string
  } | null>(null)
  const [isGenerated, setIsGenerated] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const handleGenerate = () => {
    if (isGenerated && !confirmRegenerate) {
      const userConfirmed = window.confirm(
        'Generating a new wallet will erase the current seed. Are you sure you want to continue?'
      )
      if (!userConfirmed) {
        return
      }
    }

    const wallet = ethers.Wallet.createRandom()
    setWalletInfo({
      mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : '',
      address: wallet.address,
      privateKey: wallet.privateKey,
    })
    setIsGenerated(true)
    setConfirmRegenerate(false)
    setShowDetails(true)
    setCopyStatus('')
  }

  const handleRegenerateClick = () => {
    if (isGenerated) {
      setConfirmRegenerate(true)
    }
    handleGenerate()
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(`${label} copied!`)
      setTimeout(() => setCopyStatus(''), 2000) // Clear the copied status after 2 seconds
    })
  }

  return (
    <Card title="Generate New Ethereum Wallet">
      <CardDescription>
        Click the button below to generate a new Ethereum wallet using
        ethers.js. The mnemonic (seed) phrase, wallet address, and private key
        will be displayed here. Make sure to keep them secure.
      </CardDescription>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          width: '100%',
        }}
      >
        <Button colorStyle="purplePrimary" onClick={handleRegenerateClick}>
          Generate Wallet
        </Button>
        {isGenerated && (
          <Button colorStyle="purplePrimary" onClick={toggleDetails}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        )}
        {showDetails && isGenerated && walletInfo && (
          <>
            <Typography
              asProp="p"
              fontVariant="labelHeading"
              color="textTertiary"
            >
              Wallet Address:
            </Typography>
            <Typography
              asProp="p"
              onClick={() => copyToClipboard(walletInfo.address, 'Address')}
              style={{ cursor: 'pointer' }}
            >
              {walletInfo.address}
            </Typography>
            <Typography
              asProp="p"
              fontVariant="labelHeading"
              color="textTertiary"
            >
              Mnemonic (Seed) Phrase:
            </Typography>
            <Typography
              asProp="p"
              onClick={() => copyToClipboard(walletInfo.mnemonic, 'Mnemonic')}
              style={{ fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {walletInfo.mnemonic}
            </Typography>
            <Typography
              asProp="p"
              fontVariant="labelHeading"
              color="textTertiary"
            >
              Private Key:
            </Typography>
            <Typography
              asProp="p"
              onClick={() =>
                copyToClipboard(walletInfo.privateKey, 'Private key')
              }
              style={{ fontSize: '0.5rem', cursor: 'pointer' }}
            >
              {walletInfo.privateKey}
            </Typography>
            {copyStatus && (
              <Typography asProp="p" style={{ color: '#0070f3' }}>
                {copyStatus}
              </Typography>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

export default GenerateMnemonic
