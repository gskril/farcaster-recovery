import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { custody_address } = req.query as { custody_address: string };

  if (!custody_address) {
    return res.status(400).json({ error: 'Custody address is required.' });
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/custody-address?custody_address=${custody_address}`, {
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
    console.error('Failed to fetch data from Neynar:', error);
    return res.status(500).json({ error: error.message });
  }
}
