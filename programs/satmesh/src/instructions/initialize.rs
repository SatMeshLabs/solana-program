use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeContext {}

pub fn handler(ctx: Context<InitializeContext>) -> Result<()> {



    Ok(())
}