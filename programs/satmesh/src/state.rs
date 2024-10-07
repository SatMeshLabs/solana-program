use anchor_lang::prelude::*;

// The InitialOwner struct represents the account state for the initial owner.

impl EventAccount {
    // Define the maximum size of the EscrowAccount struct in bytes.
    pub const MAX_SIZE: usize =  8 + 8 + 8 + 8 + 8 + 32 + 32 + 1;
}

#[account]
#[derive(Default)]
pub struct EventAccount {
    pub event_id: u64,
    pub supply: u64,
    pub minted: u64,
    pub date: u64, //epoch timestamps
    pub price: u64, // in lamports
    pub event_manager: Pubkey,
    pub token: Pubkey,
    pub bump: u8, // for calculating pda
}
