import { createMint } from "@solana/spl-token";
import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "../wba-wallet.json";

// Load the wallet and mint keypair from keypair files
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Set the commitment level and establish a connection to the Solana devnet
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
  try {
    // Create a new mint and log the mint address
    const mint = Keypair.generate();
    let mint_address = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6,
      mint
    );
    console.log(`Mint: ${mint_address.toBase58()}`);
  } catch (error) {
    // Log any errors that occur during the mint creation process
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
