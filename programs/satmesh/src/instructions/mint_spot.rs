use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{self, Mint, TokenAccount, Token, MintTo};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
#[instruction(_event_id: u64, _event_bump: u8, _mint_position: u64)]
pub struct MintSpotContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = token_mint.key() == event_account.token,
        seeds = [b"event-data".as_ref(), _event_id.to_le_bytes().as_ref()], 
        bump = event_account.bump
    )]
    pub event_account: Box<Account<'info, EventAccount>>,
   
    #[account(
        mut,
        seeds = [b"event-asset".as_ref(), _event_id.to_le_bytes().as_ref()], 
        bump = _event_bump
    )]
    pub event_token_account: Box<Account<'info, TokenAccount>>,


    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut, constraint = token_ata_sender.mint == token_mint.key(), constraint = token_ata_sender.owner == authority.key())]
    pub token_ata_sender: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        seeds = [b"spot-nft".as_ref(),event_account.key().as_ref(),_mint_position.to_le_bytes().as_ref()], 
        bump,
        mint::decimals = 0,
        mint::authority = event_account,
        mint::freeze_authority = event_account
    )]
    pub spot_nft: Box<Account<'info, Mint>>,

    #[account(init, 
        payer = authority, 
        associated_token::mint = spot_nft, 
        associated_token::authority = authority.to_account_info())
    ]
    pub receiver_spot_ata: Box<Account<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<MintSpotContext>, _event_id: u64, _event_bump: u8, _mint_position: u64) -> Result<()> {




    let event_account = &mut ctx.accounts.event_account;
    let authority_clone = ctx.accounts.authority.to_account_info().key();
    let token_mint = ctx.accounts.token_mint.to_account_info().key();

    event_account.minted += 1;
    // require!(event_account.minted.eq(&_mint_position), ErrorCode::IncorrectNftPosition);

    // Create a transfer instruction to move tokens from the token_ata_sender account to the escrow_token_account
    let transfer_instruction = anchor_spl::token::Transfer {
        from: ctx.accounts.token_ata_sender.to_account_info(),
        to: ctx.accounts.event_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    // Create a CPI (Cross-Program Invocation) context for calling the token program's transfer instruction
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    // Call the token program's transfer instruction using the CPI context and transfer the specified amount of tokens
    anchor_spl::token::transfer(cpi_ctx, event_account.price)?;




    // [b"event-data".as_ref(), _event_id.to_le_bytes().as_ref()], 
    let _bump = event_account.bump;

        let bump_vector = _bump.to_le_bytes();
        let binding = _event_id.to_le_bytes();
        let inner = vec![b"event-data".as_ref(), binding.as_ref(),bump_vector.as_ref()];
        let outer = vec![inner.as_slice()];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.spot_nft.to_account_info(),
            to: ctx.accounts.receiver_spot_ata.to_account_info(),
            authority: event_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts
            , outer.as_slice());
        
        // NFT will be minted to the receiver's address
        anchor_spl::token::mint_to(cpi_ctx, 1)?;





    Ok(())
}