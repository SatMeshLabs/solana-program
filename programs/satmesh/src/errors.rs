use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    // Define error codes and their corresponding error messages.

    #[msg("Event Creation Failed.")]
    EventNotCreated,

    #[msg("User not Shortlisted.")]
    UserNotShortlisted,

    #[msg("Not Enough Funds to create Event.")]
    NotEnoughFund,

    #[msg("This ticket is already being claimed.")]
    TicketAlreadyClaimed,

    #[msg("Event no longer exists.")]
    EventEnded,

    #[msg("Event already started.")]
    EventAlreadyStarted,

    #[msg("Incorrect Nft Position")]
    IncorrectNftPosition,
}