use anchor_lang::prelude::*;

#[error_code]
pub enum MarketplaceError {
    #[msg("Length of the marketplace name must be between 1 and 32 characters")]
    InvalidName,
}
