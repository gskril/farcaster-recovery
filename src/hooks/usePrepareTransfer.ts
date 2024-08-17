import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts'
import { usePublicClient, useQuery } from 'wagmi'

import {
  ID_REGISTRY,
  ID_REGISTRY_EIP_712_DOMAIN,
  ID_REGISTRY_EIP_712_TYPES,
} from '../contracts'

export function usePrepareTransfer({ fid }: { fid?: bigint }) {
  const publicClient = usePublicClient({ chainId: 10 })

  return useQuery(['transfer', fid], async () => {
    if (!fid) return null
    const mnemonic = generateMnemonic(english)
    const account = mnemonicToAccount(mnemonic)

    const nonce = await publicClient.readContract({
      ...ID_REGISTRY,
      functionName: 'nonces',
      args: [account.address],
    })

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60)

    const signature = await account.signTypedData({
      domain: ID_REGISTRY_EIP_712_DOMAIN,
      types: ID_REGISTRY_EIP_712_TYPES,
      primaryType: 'Transfer',
      message: {
        fid,
        to: account.address,
        nonce,
        deadline,
      },
    })

    return { mnemonic, newCustodyAddress: account.address, deadline, signature }
  })
}
