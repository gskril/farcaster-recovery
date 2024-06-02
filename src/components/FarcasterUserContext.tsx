import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useContractRead } from 'wagmi';
import { ID_REGISTRY } from '../contracts';

type UserType = {
  fid: number;
  custodyAddress: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  bioText: string;
  followerCount: number;
  followingCount: number;
  activeStatus: string;
  powerBadge: boolean;
};

type UserContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  recoveryAddress: string | null;
  fid: number | null;
  signature: string | null;
  setSignature: (signature: string | null) => void;
  timestamp: number | null;
  setTimestamp: (timestamp: number | null) => void;
  toAddress: string;
  setToAddress: (toAddress: string) => void;
};

const FarcasterUserContext = createContext<UserContextType | undefined>(undefined);

export const FarcasterUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [fid, setFid] = useState<number | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedFid = localStorage.getItem('fid');
    const storedSignature = localStorage.getItem('signature');
    const storedTimestamp = localStorage.getItem('timestamp');
    const storedToAddress = localStorage.getItem('toAddress');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedFid) setFid(JSON.parse(storedFid));
    if (storedSignature) setSignature(storedSignature);
    if (storedTimestamp) setTimestamp(JSON.parse(storedTimestamp));
    if (storedToAddress) setToAddress(storedToAddress);
  }, []);

  useEffect(() => {
    if (user) {
      setFid(user.fid);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (fid !== null) localStorage.setItem('fid', JSON.stringify(fid));
  }, [fid]);

  useEffect(() => {
    if (signature !== null) localStorage.setItem('signature', signature);
  }, [signature]);

  useEffect(() => {
    if (timestamp !== null) localStorage.setItem('timestamp', JSON.stringify(timestamp));
  }, [timestamp]);

  useEffect(() => {
    if (toAddress !== '') localStorage.setItem('toAddress', toAddress);
  }, [toAddress]);

  const { data: recoveryAddress } = useContractRead({
    ...ID_REGISTRY,
    functionName: 'recoveryOf',
    args: fid ? [BigInt(fid)] : undefined,
    enabled: !!fid,
  });

  return (
    <FarcasterUserContext.Provider
      value={{
        user,
        setUser,
        recoveryAddress: recoveryAddress ?? null,
        fid,
        signature,
        setSignature,
        timestamp,
        setTimestamp,
        toAddress,
        setToAddress,
      }}
    >
      {children}
    </FarcasterUserContext.Provider>
  );
};

export const useFarcasterUser = () => {
  const context = useContext(FarcasterUserContext);
  if (context === undefined) {
    throw new Error('useFarcasterUser must be used within a FarcasterUserProvider');
  }
  return context;
};
