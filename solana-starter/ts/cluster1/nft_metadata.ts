import {
  createSignerFromKeypair,
  signerIdentity
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import wallet from "../wba-wallet.json";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

const image_uri =
  "https://devnet.irys.xyz/4FPFrpQvy6ot8br3WyjwFD3pXR7QfDts3DFQsqBNCM1g";

(async () => {
  try {
    const metadata = {
      name: "Lezend Turbin3 Rug",
      symbol: "RUG",
      description: "Lezend Turbin3 Rug",
      image: image_uri,
      attributes: [
        { trait_type: "Rarity", value: "Mythic" },
        { trait_type: "Face", value: "Handsome" },
        { trait_type: "Body", value: "Athletic" }
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image_uri
          }
        ]
      },
      creators: [
        {
          address: keypair.publicKey,
          share: 100
        }
      ]
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log("Your metadata URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
