# Lezend's Turbin3 Q4 Builders cohort work

This repository contains the work I completed as part of the Turbin3 Q4 2024 Builders cohort.

**Dev Wallet**: `9fBPHthnGU2SBaSifXhDw526q2R27HBjt7VyJi67bX8z`

I replaced Yarn with the Bun package manager due to personal preference, as Bun is newer, faster, and gaining popularity. If Bun becomes problematic at any point, it can easily be reverted back to Yarn by deleting the `bun.lockb` file and running `yarn install` again.

[Bun Docs](https://bun.sh/docs)

## Week-1

- Minted an SPL token with metadata and conducted test transfers on devnet.
    **Token address**: `7DT1DrgoPYnWTaGyZkHW3qjr7cKTTbKsvHqH6diSNC18`
    ![SPL Token](./assets/images/spl-token.png)

- Created and minted an NFT with metadata and an image on devnet using Metaplex’s UMI framework.
    **NFT address**: `8hs7LbyjZASixveLrtgpdQZa9cCc5heDWYcgsySyBgEC`
    ![NFT](./assets/images/rug-nft.png)

## Week-2

- [Vault Program](/programs/vault-program): Developed a basic Solana vault program enabling users to deposit and withdraw SOL, accompanied by comprehensive tests for all instructions.

- [Escrow Program](/programs/escrow-program): Developed an escrow program enabling two users to securely swap tokens without requiring a centralized counterparty. The implementation includes all relevant test cases to ensure reliability and accuracy.

- [NFT Staking Program](/programs/nft-staking-program/): Implemented an NFT staking program that allows users to stake their NFTs for a specified minimum freeze period and earn rewards for their commitment. Comprehensive tests are included to ensure reliability and accuracy.
