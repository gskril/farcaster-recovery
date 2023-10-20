import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query as { address: string }

  try {
    const warpcast = await fetch(
      `https://api.phrasetown.com/v0/proxy?https://api.warpcast.com/v2/user-by-verification?address=${address}`
    ).then((res) => res.json())

    return res.status(200).json(warpcast)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
