import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query as { username: string };

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const response = await fetch(`https://api.neynar.com/v1/farcaster/user-by-username?username=${username}`, {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Failed to fetch data from Neynar using username:', error);
    return res.status(500).json({ error: error.message });
  }
}
