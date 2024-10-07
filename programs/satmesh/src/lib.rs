use anchor_lang::prelude::*;

// Define the program
declare_id!("B53qbHQgjbcpyDkBJ48U3b91K6Aqt8xtPLHqDT4D3A6x");

#[program]
pub mod my_payable_contract {
    use super::*;

    // Payable function that accepts a string argument
    pub fn send_tx_to_network(ctx: Context<SendMessage>, message: String) -> Result<()> {
        // Log the received message
        msg!("Received message: {}", message);

        // This is where we would handle the payment, 
        // but in Solana, we usually deal with token transfers or lamports (native currency)
        let user = &mut ctx.accounts.user;
        let payment_amount = 1000; // Example: user needs to send 1000 lamports to use this function
        require!(**user.lamports.borrow() >= payment_amount, CustomError::InsufficientFunds);

        // Transfer the lamports to the program's account
        **user.try_borrow_mut_lamports()? -= payment_amount;
        **ctx.accounts.program_account.try_borrow_mut_lamports()? += payment_amount;

        Ok(())
    }
}

// Define the context for the function call
#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub user: Signer<'info>,  // The person calling the function
    #[account(mut)]
    pub program_account: AccountInfo<'info>,  // The program's account
}

// Define custom errors
#[error_code]
pub enum CustomError {
    #[msg("Insufficient funds sent for this transaction.")]
    InsufficientFunds,
}