# Farcaster FID Manager

This project provides a set of tools and UI components for managing Farcaster FIDs (Farcaster Identifiers). It includes functionalities for fetching user data, generating Ethereum wallets, creating EIP-712 transfer signatures, and submitting recovery and transfer transactions.


## Installation

1. Clone the repository:

```sh
git clone https://github.com/your-repo/farcaster-fid-manager.git
cd farcaster-fid-manager
```

2. Install dependencies:

```sh
npm install
```

## Usage

1. Start the development server:

```sh
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`.

## Scripts

- `dev`: Starts the development server.
- `build`: Builds the application for production.
- `start`: Starts the production server.
- `lint`: Runs ESLint to check for code quality issues.
- `clean`: Removes the `node_modules` and `.next` directories.
- `prettier:check`: Checks the code formatting using Prettier.
- `prettier:fix`: Fixes the code formatting using Prettier.

## Components

### FarcasterUserInfo

This component fetches and displays user data based on a Farcaster username or Ethereum custody address.

### GenerateMnemonic

This component generates a new Ethereum wallet using ethers.js, displaying the mnemonic, wallet address, and private key.

### GenerateTransferSignature

This component creates and signs an EIP-712 message for transferring FID to another address.

### SubmitRecoverFunction

This component submits a recovery transaction using the previously generated signature.

### SubmitTransferFunction

This component submits a transfer transaction using the previously generated signature.

### UpdateRecoveryAddress

This component sets the recovery address for a Farcaster account.

## API Endpoints

### `/api/user-by-username`
Fetches user data by Farcaster username.

### `/api/user-by-custody`
Fetches user data by Ethereum custody address.

---

This project leverages various technologies including Next.js, ethers.js, and Wagmi for managing Ethereum interactions and Farcaster user data.

### Contract Addresses

- **ID Registry Contract**: 0x00000000Fc6c5F01Fc30151999387Bb99A9f489b
