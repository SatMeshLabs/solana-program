use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod iknowspots {
    use crate::instruction::EventCreation;

    use super::*;

    pub fn initialize(ctx: Context<InitializeContext>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn event_creation(ctx: Context<EventCreationContext>, _event_id: u64, _supply: u64, _price:u64, _date: u64) -> Result<()> {
        event_creation::handler(ctx, _event_id, _supply, _price, _date)
    }

    pub fn mint_spot(ctx: Context<MintSpotContext>, _event_id: u64, _event_bump: u8, _mint_position: u64) -> Result<()> {
        mint_spot::handler(ctx, _event_id, _event_bump,_mint_position)
    }

    pub fn burn_spot(ctx: Context<BurnSpotContext>, _event_id: u64, _event_bump: u8, _mint_position: u64, _spot_nft_bump: u8) -> Result<()> {
        burn_spot::handler(ctx, _event_id, _event_bump,_mint_position, _spot_nft_bump)
    }



}







