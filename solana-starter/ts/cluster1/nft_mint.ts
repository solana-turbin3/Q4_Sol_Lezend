import {
  createNft,
  mplTokenMetadata
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import base58 from "bs58";
import wallet from "../wba-wallet.json";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

const metadata_uri =
  "https://devnet.irys.xyz/AWk1qEDu8XsAUbDZJWCcsW6vFLT361n2WxQh9PB3gZf4";

(async () => {
  let tx = createNft(umi, {
    name: "Lezend Turbin3 Rug",
    symbol: "RUG",
    uri: metadata_uri,
    sellerFeeBasisPoints: percentAmount(100),
    mint
  });
  let result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log("Mint Address: ", mint.publicKey);
})();

// Mint Address:  6Pdvt2oNPaq8XPtLPtWQrCB1RGTU19DRtKYoeBTJEEtu
