import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "../wba-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 100_000_000n;

// Mint address
const mint = new PublicKey("7DT1DrgoPYnWTaGyZkHW3qjr7cKTTbKsvHqH6diSNC18");

(async () => {
  try {
    let ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    console.log(`Your ata is: ${ata.address.toBase58()}`);

    let txId = await mintTo(
      connection,
      keypair,
      mint,
      ata.address,
      keypair,
      token_decimals
    );
    console.log(`Your mint txid: ${txId}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
