use anchor_lang::prelude::*;

declare_id!("9NDusP73MVbsD2tt8RFEP83jBRwXw3aw37PkeeCRbFxs");

#[program]
pub mod satmesh {
    use super::*;

    pub fn initialize_data(ctx: Context<InitializeData>, id: String, value: String) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;

        // If the account is initialized, check for existing IDs
        if !data_account.entries.is_empty() {
            for entry in &data_account.entries {
                if entry.id == id {
                    return Err(ErrorCode::IdAlreadyExists.into());
                }
            }
        } else {
            // If it's the first entry, initialize the vector if needed
            data_account.entries = Vec::new();
        }

        // Add the new entry with the provided ID and value
        data_account.entries.push(DataEntry { id, value });

        msg!("Data initialized");
        Ok(())
    }

    pub fn fetch_data(ctx: Context<FetchData>, id: String) -> Result<()> {
        let data_account = &ctx.accounts.data_account;

        // Log the ID being searched for
        msg!("Searching for ID: {}", id);

        // Search for the entry with the given ID
        for entry in &data_account.entries {
            msg!("Checking entry ID: {}", entry.id); // Log each ID being checked
            if entry.id == id {
                msg!("Found entry: {:?}", entry);
                return Ok(());
            }
        }

        msg!("ID not found: {}", id); // Log if ID is not found
        Err(ErrorCode::DataNotFound.into())
    }
}
#[derive(Accounts)]
pub struct InitializeData<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + std::mem::size_of::<DataAccount>() + (std::mem::size_of::<DataEntry>() * 100), // Adjust size as necessary
        seeds = [b"sat_mesh", user.key().as_ref()],
        bump,
    )]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FetchData<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
}

#[account]
pub struct DataAccount {
    pub entries: Vec<DataEntry>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Debug)]
pub struct DataEntry {
    pub id: String,
    pub value: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The data with the specified ID already exists.")]
    IdAlreadyExists,
    #[msg("The data with the specified ID was not found.")]
    DataNotFound,
}
