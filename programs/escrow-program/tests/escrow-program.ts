import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { expect } from "chai";
import { EscrowProgram } from "../target/types/escrow_program";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const provider = <anchor.AnchorProvider>anchor.getProvider();
const program = anchor.workspace.EscrowProgram as Program<EscrowProgram>;
const connection = provider.connection;

const maker = provider.wallet as anchor.Wallet;
const taker = anchor.web3.Keypair.generate();

let seed: anchor.BN;
let mintA: anchor.web3.PublicKey;
let mintB: anchor.web3.PublicKey;
let escrow: anchor.web3.PublicKey;
let vault: anchor.web3.PublicKey;
let makerAtaA: anchor.web3.PublicKey;

const receiveAmount = 50_000_000;
const deposit = 10_000_000;
const initialMakerAtaABalance = 100_000_000;
const initialTakerAtaBBalance = 100_000_000;

const common_setup = async () => {
  seed = new anchor.BN(Math.floor(Math.random() * 1000000000));

  // Create mints
  mintA = await createMint(connection, maker.payer, maker.publicKey, null, 6);
  mintB = await createMint(connection, maker.payer, maker.publicKey, null, 6);

  // Derive escrow address
  escrow = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
      mintA.toBuffer(),
      mintB.toBuffer()
    ],
    program.programId
  )[0];

  // Derive vault address
  vault = getAssociatedTokenAddressSync(mintA, escrow, true);

  makerAtaA = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      maker.payer,
      mintA,
      maker.publicKey
    )
  ).address;

  await mintTo(
    connection,
    maker.payer,
    mintA,
    makerAtaA,
    maker.payer,
    initialMakerAtaABalance
  );

  await connection.requestAirdrop(
    taker.publicKey,
    1 * anchor.web3.LAMPORTS_PER_SOL
  );
};

describe("Make and cancel", () => {
  before(async () => {
    await common_setup();
  });

  it("Init escrow and deposit", async () => {
    await program.methods
      .initEscrowAndDeposit(
        seed,
        new anchor.BN(receiveAmount),
        new anchor.BN(deposit)
      )
      .accounts({
        maker: maker.publicKey,
        mintA,
        mintB,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([maker.payer])
      .rpc();

    const vaultBalance = Number(
      (await connection.getTokenAccountBalance(vault)).value.amount
    );
    const makerAtaABalance = Number(
      (await connection.getTokenAccountBalance(makerAtaA)).value.amount
    );

    expect(vaultBalance).to.equal(deposit);
    expect(makerAtaABalance).to.equal(initialMakerAtaABalance - deposit);
  });

  it("Cancel and refund", async () => {
    await program.methods
      .cancelAndRefund()
      .accounts({ tokenProgram: TOKEN_PROGRAM_ID })
      .accountsPartial({
        maker: maker.publicKey,
        mintA,
        escrow
      })
      .signers([maker.payer])
      .rpc();

    // Check that the vault is closed
    try {
      await connection.getTokenAccountBalance(vault);
    } catch (error) {
      expect(error.toString()).to.include("could not find account");
    }

    const makerAtaBalanceA = Number(
      (await connection.getTokenAccountBalance(makerAtaA)).value.amount
    );
    expect(makerAtaBalanceA).to.equal(initialMakerAtaABalance);
  });
});

describe("Make and Take", () => {
  let takerAtaB: anchor.web3.PublicKey;

  before(async () => {
    await common_setup();

    takerAtaB = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        maker.payer,
        mintB,
        taker.publicKey
      )
    ).address;

    await mintTo(
      connection,
      maker.payer,
      mintB,
      takerAtaB,
      maker.payer,
      initialTakerAtaBBalance
    );
  });

  it("Init escrow and deposit", async () => {
    await program.methods
      .initEscrowAndDeposit(
        seed,
        new anchor.BN(receiveAmount),
        new anchor.BN(deposit)
      )
      .accounts({
        maker: maker.publicKey,
        mintA,
        mintB,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([maker.payer])
      .rpc();

    const vaultBalance = Number(
      (await connection.getTokenAccountBalance(vault)).value.amount
    );
    const makerAtaBalanceA = Number(
      (await connection.getTokenAccountBalance(makerAtaA)).value.amount
    );

    expect(vaultBalance).to.equal(deposit);
    expect(makerAtaBalanceA).to.equal(initialMakerAtaABalance - deposit);
  });

  it("Take and close vault", async () => {
    await program.methods
      .takeAndCloseVault()
      .accounts({
        taker: taker.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .accountsPartial({
        escrow,
        maker: maker.publicKey,
        mintA,
        mintB
      })
      .signers([taker])
      .rpc();

    const makerAtaB = getAssociatedTokenAddressSync(mintB, maker.publicKey);
    const makerAtaBalanceB = Number(
      (await connection.getTokenAccountBalance(makerAtaB)).value.amount
    );
    const takerAtaA = getAssociatedTokenAddressSync(mintA, taker.publicKey);
    const takerAtaBalanceA = Number(
      (await connection.getTokenAccountBalance(takerAtaA)).value.amount
    );
    const takerAtaBalanceB = Number(
      (await connection.getTokenAccountBalance(takerAtaB)).value.amount
    );

    expect(makerAtaBalanceB).to.equal(receiveAmount);
    expect(takerAtaBalanceA).to.equal(deposit);
    expect(takerAtaBalanceB).to.equal(initialTakerAtaBBalance - receiveAmount);
  });
});
