import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fid } = req.query as { fid: string }

  // Verify that fid is a number
  if (!/^\d+$/.test(fid)) {
    return res.status(400).json({ error: 'Invalid FID' })
  }

  try {
    const username = await getUserDataByFid(parseInt(fid), 6)
    return res.status(200).json({ username })
  } catch (error) {
    return res.status(500).json({ username: undefined })
  }
}

async function getUserDataByFid(fid: number, type: number) {
  const res = await fetch(
    `https://hoyt.farcaster.xyz:2281/v1/userDataByFid?fid=${fid}&user_data_type=${type}`
  )

  const data = (await res.json()) as {
    data: {
      type: string
      fid: number
      timestamp: number
      network: string
      userDataBody: {
        type: string
        value: string
      }
    }
    hash: string
    hashScheme: string
    signature: string
    signatureScheme: string
    signer: string
  }

  return data.data.userDataBody.value
}
