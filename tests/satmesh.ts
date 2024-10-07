import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SatMesh } from "../target/types/satmesh";
import * as spl from "@solana/spl-token";
import { BN } from "bn.js";
const {
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
} = anchor.web3;

describe("satmesh", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SatMesh as Program<SatMesh>;


  const provider = anchor.AnchorProvider.local();
  // Get the wallet instance
  const wallet = provider.wallet as anchor.Wallet;

  // Variables for USDC token creation
  let usdcKey; // Keypair for the USDC token
  let usdcAta; // Associated token account (ATA) for the USDC token

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create USDC tokens", async () => {
    // Generate a new keypair for the USDC token
    usdcKey = anchor.web3.Keypair.generate();

    // Determine the associated token account (ATA) owned by the provider's wallet
    usdcAta = await spl.getAssociatedTokenAddress(
      usdcKey.publicKey,
      provider.wallet.publicKey,
      false,
      spl.TOKEN_PROGRAM_ID,
      spl.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create a transaction to initialize the USDC token and mint tokens to the ATA owned by the provider's wallet
    const mintAmount = 47402004034546; // Amount of tokens to mint
    let createMintTx = new Transaction().add(
      // Create the mint account
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: usdcKey.publicKey,
        space: spl.MintLayout.span,
        lamports: await spl.getMinimumBalanceForRentExemptMint(program.provider.connection),
        programId: spl.TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint account
      spl.createInitializeMintInstruction(usdcKey.publicKey, 6, provider.wallet.publicKey, provider.wallet.publicKey, spl.TOKEN_PROGRAM_ID)
    ).add(
      // Create the associated token account
      spl.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        usdcAta,
        provider.wallet.publicKey,
        usdcKey.publicKey,
        spl.TOKEN_PROGRAM_ID,
        spl.ASSOCIATED_TOKEN_PROGRAM_ID
      )
    ).add(
      // Mint tokens to the associated token account
      spl.createMintToInstruction(
        usdcKey.publicKey, // Mint
        usdcAta, // Receiver (should be a token account)
        provider.wallet.publicKey, // Mint authority
        mintAmount,
        [], // Only multisig account will use. Leave it empty for now.
        spl.TOKEN_PROGRAM_ID // Program ID
      )
    );

    await program.provider.sendAndConfirm(createMintTx, [usdcKey]);
  });


  it("Is event created!", async () => {
    // Add your test here.
      let event_id = 1;
      let price = 10000000;
      let supply = 100;
      let date = 4348374;
      let [eventAccount, eventAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-data"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );
      let [eventTokenAccount, eventTokenAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-asset"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );
    const tx = await program.methods.eventCreation(
      new anchor.BN(event_id),
      new anchor.BN(price),
      new anchor.BN(supply),
      new anchor.BN(date)
      ).accounts(
      {
        authority : wallet.publicKey,
        eventAccount : eventAccount,
        tokenMint : usdcKey.publicKey,
        eventTokenAccount : eventTokenAccount
      }
    ).rpc();
    console.log("Your transaction signature", tx);

    // Fetch the escrow account data
    let eventData = await program.account.eventAccount.fetch(eventAccount);
    console.log(eventData);

  });


  it("Mint Spot", async () => {

    // Before calling

    

    // Add your test here.
      let event_id = 1;
      let price = 10000000;
      let supply = 100;
      let date = 4348374;
      let [eventAccount, eventAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-data"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );
      let [eventTokenAccount, eventTokenAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-asset"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );

    //   #[account(
    //     init,
    //     payer = authority,
    //     seeds = [b"spot-nft".as_ref(),event_account.key().as_ref(),_mint_position.to_le_bytes().as_ref()], 
    //     bump,
    //     mint::decimals = 0,
    //     mint::authority = event_account,
    //     mint::freeze_authority = event_account
    // )]
    // pub spot_nft: Box<Account<'info, Mint>>,

    // #[account(init, 
    //     payer = authority, 
    //     associated_token::mint = spot_nft, 
    //     associated_token::authority = authority.to_account_info())
    // ]
    // pub receiver_spot_ata: Box<Account<'info, TokenAccount>>,
        let _mint_position = 1;
      let [spotNft, spotNftBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("spot-nft"), eventAccount.toBuffer() ,new BN(_mint_position).toArrayLike(Buffer,"le",8)],
        program.programId
      );

    //       // Determine the associated token account (ATA) owned by the provider's wallet
    // usdcAta = await spl.getAssociatedTokenAddress(
    //   usdcKey.publicKey,
    //   provider.wallet.publicKey,
    //   false,
    //   spl.TOKEN_PROGRAM_ID,
    //   spl.ASSOCIATED_TOKEN_PROGRAM_ID
    // );


      let nftAta = await spl.getAssociatedTokenAddress(
        spotNft,
          provider.wallet.publicKey,
          false,
          spl.TOKEN_PROGRAM_ID,
          spl.ASSOCIATED_TOKEN_PROGRAM_ID
        );



// Check the escrow account balance
let escrowBalance = await program.provider.connection.getTokenAccountBalance(eventTokenAccount);
console.log("Escrow account balance before:", escrowBalance.value.uiAmount);
let ataBalance = await program.provider.connection.getTokenAccountBalance(usdcAta);
console.log("ATA balance before:", ataBalance.value.uiAmount);





    const tx = await program.methods.mintSpot(
      new anchor.BN(event_id),
      eventTokenAccountBumb,
      new anchor.BN(1)
      ).accounts(
      {
        authority : wallet.publicKey,
        eventAccount : eventAccount,
        tokenMint : usdcKey.publicKey,
        eventTokenAccount : eventTokenAccount,
        tokenAtaSender : usdcAta,
        spotNft : spotNft,
        receiverSpotAta : nftAta
      }
    ).rpc();
    console.log("Your transaction signature", tx);

    // Fetch the escrow account data
    let eventData = await program.account.eventAccount.fetch(eventAccount);
    console.log(eventData);


    // Check the escrow account balance
    console.log("--------------- Escrow account balance after -----------------");
escrowBalance = await program.provider.connection.getTokenAccountBalance(eventTokenAccount);
console.log("Escrow account balance before:", escrowBalance.value.uiAmount);
ataBalance = await program.provider.connection.getTokenAccountBalance(usdcAta);
console.log("ATA balance before:", ataBalance.value.uiAmount);
let nftBalance = await program.provider.connection.getTokenAccountBalance(nftAta);
console.log("ATA balance of nft:", nftBalance.value.uiAmount);

  });

  it("Burn Spot", async () => {

    // Before calling

    

    // Add your test here.
      let event_id = 1;
      let price = 10000000;
      let supply = 100;
      let date = 4348374;
      let [eventAccount, eventAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-data"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );
      let [eventTokenAccount, eventTokenAccountBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("event-asset"), new BN(event_id).toArrayLike(Buffer,"le",8)],
        program.programId
      );

    //   #[account(
    //     init,
    //     payer = authority,
    //     seeds = [b"spot-nft".as_ref(),event_account.key().as_ref(),_mint_position.to_le_bytes().as_ref()], 
    //     bump,
    //     mint::decimals = 0,
    //     mint::authority = event_account,
    //     mint::freeze_authority = event_account
    // )]
    // pub spot_nft: Box<Account<'info, Mint>>,

    // #[account(init, 
    //     payer = authority, 
    //     associated_token::mint = spot_nft, 
    //     associated_token::authority = authority.to_account_info())
    // ]
    // pub receiver_spot_ata: Box<Account<'info, TokenAccount>>,
        let _mint_position = 1;
      let [spotNft, spotNftBumb] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("spot-nft"), eventAccount.toBuffer() ,new BN(_mint_position).toArrayLike(Buffer,"le",8)],
        program.programId
      );

    //       // Determine the associated token account (ATA) owned by the provider's wallet
    // usdcAta = await spl.getAssociatedTokenAddress(
    //   usdcKey.publicKey,
    //   provider.wallet.publicKey,
    //   false,
    //   spl.TOKEN_PROGRAM_ID,
    //   spl.ASSOCIATED_TOKEN_PROGRAM_ID
    // );


      let nftAta = await spl.getAssociatedTokenAddress(
        spotNft,
          provider.wallet.publicKey,
          false,
          spl.TOKEN_PROGRAM_ID,
          spl.ASSOCIATED_TOKEN_PROGRAM_ID
        );



// Check the escrow account balance
let escrowBalance = await program.provider.connection.getTokenAccountBalance(eventTokenAccount);
console.log("Escrow account balance before:", escrowBalance.value.uiAmount);
let ataBalance = await program.provider.connection.getTokenAccountBalance(usdcAta);
console.log("ATA balance before:", ataBalance.value.uiAmount);





    const tx = await program.methods.burnSpot(
      new anchor.BN(event_id),
      eventTokenAccountBumb,
      new anchor.BN(1),
      spotNftBumb
      ).accounts(
      {
        authority : wallet.publicKey,
        eventAccount : eventAccount,
        tokenMint : usdcKey.publicKey,
        eventTokenAccount : eventTokenAccount,
        tokenAtaSender : usdcAta,
        spotNft : spotNft,
        receiverSpotAta : nftAta
      }
    ).rpc();
    console.log("Your transaction signature", tx);

    // Fetch the escrow account data
    let eventData = await program.account.eventAccount.fetch(eventAccount);
    console.log(eventData);


    // Check the escrow account balance
    console.log("--------------- Escrow account balance after -----------------");
escrowBalance = await program.provider.connection.getTokenAccountBalance(eventTokenAccount);
console.log("Escrow account balance before:", escrowBalance.value.uiAmount);
ataBalance = await program.provider.connection.getTokenAccountBalance(usdcAta);
console.log("ATA balance before:", ataBalance.value.uiAmount);
let nftBalance = await program.provider.connection.getTokenAccountBalance(nftAta);
console.log("ATA balance of nft:", nftBalance.value.uiAmount);

  });



});
