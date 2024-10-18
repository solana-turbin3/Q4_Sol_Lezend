import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import wallet from "../wba-wallet.json";

const mint = new PublicKey("7DT1DrgoPYnWTaGyZkHW3qjr7cKTTbKsvHqH6diSNC18");

// Create a UMI connection
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
  try {
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint: publicKey(mint),
      mintAuthority: signer
    };

    let data: DataV2Args = {
      name: "Lezend Turbin3",
      symbol: "LZD",
      uri: "https://turbin3.xyz",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };

    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null
    };

    let txId = await createMetadataAccountV3(umi, {
      ...accounts,
      ...args
    }).sendAndConfirm(umi);

    console.log(`https://explorer.solana.com/address/${txId}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
