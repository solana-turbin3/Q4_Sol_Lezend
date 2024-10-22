use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::state::VaultState;

#[derive(Accounts)]
pub struct Payment<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds=[b"vault", vault_state.key().as_ref()],
        bump=vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        seeds=[b"state", signer.key().as_ref()],
        bump=vault_state.vault_state_bump
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>,
}

impl<'info> Payment<'info> {
    pub fn deposit(&self, amount: u64) -> Result<()> {
        let transfer_accounts = Transfer {
            from: self.signer.to_account_info(),
            to: self.vault.to_account_info(),
        };
        let transfer_ctx =
            CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
        transfer(transfer_ctx, amount)
    }

    pub fn withdraw(&self, amount: u64) -> Result<()> {
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
        transfer(transfer_ctx, amount)
    }
}
