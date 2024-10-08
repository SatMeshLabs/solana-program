import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Satmesh } from "../target/types/satmesh";
import { expect } from 'chai';

describe("satmesh", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Satmesh as Program<Satmesh>;
  const provider = anchor.getProvider();

  const id1 = "unique-id-1"; // Example ID for testing
  const value1 = "This is a test value";
  const id2 = "unique-id-2"; // New unique ID for testing
  const value2 = "Another test value";

  let dataPDA: anchor.web3.PublicKey;

  before(async () => {
    // Derive the PDA for the data account once before the tests
    [dataPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("sat_mesh"),
        provider.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("Can initialize and fetch data", async () => {
    // Initialize the data with ID and value
    await program.methods.initializeData(id1, value1)
      .accounts({
        dataAccount: dataPDA,
        user: provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    // Fetch the data account
    const dataAccount = await program.account.dataAccount.fetch(dataPDA);
    expect(dataAccount.entries.length).to.equal(1);
    expect(dataAccount.entries[0].id).to.equal(id1);
    expect(dataAccount.entries[0].value).to.equal(value1);

    try {
      // Attempt to initialize with the same ID to test uniqueness
      await program.methods.initializeData(id1, "Another value")
        .accounts({
          dataAccount: dataPDA,
          user: provider.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
    } catch (error) {
      console.error("Error:", error);
      if (error.error) {
        expect(error.error.errorCode).to.equal("IdAlreadyExists");
      } else {
        console.error("Unexpected error structure:", error);
      }
    }

    // Fetch the data again to confirm no new entry was added
    const updatedDataAccount = await program.account.dataAccount.fetch(dataPDA);
    expect(updatedDataAccount.entries.length).to.equal(1); // Ensure it still has only one entry
  });

  it("Can fetch data by ID", async () => {
    // Fetch the data account
    const dataAccount = await program.account.dataAccount.fetch(dataPDA);
    console.log("Current Data Account:", dataAccount);

    // Search for the entry with the given ID in the fetched data account
    const fetchedEntry = dataAccount.entries.find((entry: { id: string }) => entry.id === id1);

    // Check that fetchedEntry is defined and has the correct data
    expect(fetchedEntry).to.not.be.undefined;
    expect(fetchedEntry.id).to.equal(id1); // Verify the ID matches
    expect(fetchedEntry.value).to.equal(value1); // Verify the value matches
  });






});
