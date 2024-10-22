import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address } from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
/// J8qKEmQpadFeBuXAVseH8GNrvsyBhMT8MHSVD3enRgJz

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

// Create a random keypair
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
// const vaultAuth = ???

// Create the vault key
// Seeds are "vault", vaultAuth
// const vault = ???

// Execute our enrollment transaction
(async () => {
  try {
    // Find the vaultAuth PDA
    const [vaultAuth, _vaultAuthBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("auth"), vaultState.publicKey.toBuffer()],
      program.programId
    );

    // Execute the initialization transaction
    const signature = await program.methods
      .initialize()
      .accounts({
        owner: keypair.publicKey,
        vault: vaultState.publicKey,
        vaultAuth: vaultAuth,
        vaultState: vaultState.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
