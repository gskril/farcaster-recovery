import React, { useState, useEffect } from 'react'
import { Typography, Spinner, Input } from '@ensdomains/thorin'
import { useFarcasterUser } from './FarcasterUserContext'
import { useFetch } from '../hooks/useFetch'
import { Card, CardDescription } from './atoms'

type User = {
  fid: number
  custodyAddress: string
  username: string
  displayName: string
  pfpUrl: string
  bioText: string
  followerCount: number
  followingCount: number
  activeStatus: string
  powerBadge: boolean
}

type Props = {
  address?: string
}

const FarcasterUserInfo = ({ address }: Props) => {
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const { user, setUser, recoveryAddress } = useFarcasterUser()

  const fetchUrlByUsername = username.trim()
    ? `/api/user-by-username?username=${username.trim()}`
    : undefined
  const fetchUrlByCustody =
    !username.trim() && address
      ? `/api/user-by-custody?custody_address=${address}`
      : undefined

  const {
    data: userDataByUsername,
    error: errorByUsername,
    loading: loadingByUsername,
  } = useFetch<User>(fetchUrlByUsername)
  const {
    data: userDataByCustody,
    error: errorByCustody,
    loading: loadingByCustody,
  } = useFetch<User>(fetchUrlByCustody)

  useEffect(() => {
    if (userDataByUsername) {
      setUser(normalizeUserData(userDataByUsername, true))
    } else if (userDataByCustody) {
      setUser(normalizeUserData(userDataByCustody, false))
    } else if (!username.trim() && address) {
      // Refetch the custody address data after clearing
      setUser(null) // Clear any existing user data
    }
  }, [userDataByUsername, userDataByCustody, username, address])

  useEffect(() => {
    if (!username.trim() && address) {
      // When username is cleared, refetch data using the custody address
      const fetchCustodyData = async () => {
        const response = await fetch(
          `/api/user-by-custody?custody_address=${address}`
        )
        if (response.ok) {
          const data = await response.json()
          setUser(normalizeUserData(data, false))
        }
      }
      fetchCustodyData()
    }
  }, [username, address])

  const normalizeUserData = (data: any, byUsername: boolean) => {
    const baseUser = byUsername ? data.result.user : data.user
    return {
      fid: baseUser.fid,
      custodyAddress: baseUser.custodyAddress || baseUser.custody_address,
      username: baseUser.username,
      displayName: baseUser.displayName || baseUser.display_name,
      pfpUrl: baseUser.pfp ? baseUser.pfp.url : baseUser.pfp_url,
      bioText: baseUser.profile.bio.text,
      followerCount: baseUser.followerCount || baseUser.follower_count,
      followingCount: baseUser.followingCount || baseUser.following_count,
      activeStatus: baseUser.activeStatus || baseUser.active_status,
      powerBadge: baseUser.powerBadge,
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset copied state after 2 seconds
    })
  }

  if (!address && !username.trim()) {
    return (
      <Typography color="red">
        Please provide a username or connect your address.
      </Typography>
    )
  }

  return (
    <Card title={`@${user?.username || ''} - ${user?.displayName || ''}`}>
      <CardDescription>
        Enter a Farcaster username or connect your Ethereum address to fetch
        user data.
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a Farcaster username or leave blank for connected address"
        />
        {(loadingByUsername || loadingByCustody) && <Spinner />}
        {(errorByUsername || errorByCustody) && (
          <Typography color="red" style={{ marginTop: '1rem' }}>
            {errorByUsername?.message || errorByCustody?.message}
          </Typography>
        )}
        {user && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={user.pfpUrl}
              alt="Profile"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
            <Typography
              onClick={() => copyToClipboard(`${user.fid}`)}
              style={{ cursor: 'pointer' }}
            >{`FID: ${user.fid}`}</Typography>
            <Typography
              onClick={() => copyToClipboard(user.custodyAddress)}
              style={{ cursor: 'pointer' }}
            >{`Custody Address: ${user.custodyAddress}`}</Typography>
            <Typography
              onClick={() => copyToClipboard(recoveryAddress || '')}
              style={{ cursor: 'pointer' }}
            >{`Recovery Address: ${recoveryAddress || 'Not Set'}`}</Typography>
            <div
              style={{
                background: '#e6f4ff',
                padding: '10px',
                borderRadius: '5px',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>{`Followers: ${user.followerCount}`}</Typography>
                <Typography>{`Following: ${user.followingCount}`}</Typography>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>{`Active Status: ${user.activeStatus}`}</Typography>
                <Typography>{`Power Badge: ${user.powerBadge ? 'Yes' : 'No'}`}</Typography>
              </div>
            </div>
            {copied && (
              <Typography style={{ color: '#0070f3' }}>
                Copied to clipboard!
              </Typography>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default FarcasterUserInfo
