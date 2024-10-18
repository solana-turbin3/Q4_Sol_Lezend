import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "../wba-wallet.json";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("7DT1DrgoPYnWTaGyZkHW3qjr7cKTTbKsvHqH6diSNC18");

// Recipient address
const to = new PublicKey("AbVh32GTzzBuUYQEgZ2LjpX17StgxN5aPzqaYaxbLvB4");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    let fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    let toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );

    // Transfer the new token to the "toTokenAccount" we just created
    let txId = await transfer(
      connection,
      keypair,
      fromAta.address,
      toAta.address,
      keypair,
      3_000_000n
    );
    console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
