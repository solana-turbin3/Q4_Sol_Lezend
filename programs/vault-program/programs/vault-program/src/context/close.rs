use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::state::VaultState;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds=[b"vault", vault_state.key().as_ref()],
        bump=vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        mut,
        seeds=[b"state", signer.key().as_ref()],
        bump=vault_state.vault_state_bump,
        close = signer
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>,
}

impl<'info> Close<'info> {
    pub fn close(&self) -> Result<()> {
        // Empty out the account first
        let transfer_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.signer.to_account_info(),
        };

        let seeds = &[
            b"vault",
            self.vault_state.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump],
        ];

        let pda_signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            transfer_accounts,
            pda_signer,
        );

        transfer(transfer_ctx, self.vault.lamports())
    }
}
