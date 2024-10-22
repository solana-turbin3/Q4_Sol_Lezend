import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { VaultProgram } from "../target/types/vault_program";

describe("vault-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(AnchorProvider.env());

  const provider = <AnchorProvider>anchor.getProvider();
  const program = anchor.workspace.VaultProgram as Program<VaultProgram>;
  const signer = provider.wallet as anchor.Wallet;

  const vaultState = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), signer.publicKey.toBuffer()],
    program.programId
  )[0];
  const vault = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultState.toBuffer()],
    program.programId
  )[0];

  it("Initialize", async () => {
    await program.methods.initialize().rpc();
  });

  it("Deposit", async () => {
    await program.methods
      .deposit(new BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsStrict({
        vault,
        vaultState,
        signer: signer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("Withdraw", async () => {
    await program.methods
      .withdraw(new BN(0.5 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsStrict({
        vault,
        vaultState,
        signer: signer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("Close", async () => {
    await program.methods
      .close()
      .accountsStrict({
        vault,
        vaultState,
        signer: signer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });
});
