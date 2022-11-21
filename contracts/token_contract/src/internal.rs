//! Internal Contract Methods
//!

use near_sdk::require;

use crate::*;

impl Contract {
    /// Internal method to force getting the balance of an account
    /// If account has no bal, panic with message
    pub(crate) fn internal_unwrap_balance_of(&self, account_id: &AccountId) -> Balance {
        match self.accounts.get(account_id) {
            Some(balance) => balance,
            None => {
                env::panic_str(format!("The Account {} is not registered", &account_id).as_str())
            }
        }
    }

    /// Internal method for depositing some amount of FT into a/c
    pub(crate) fn internal_deposit(&mut self, account_id: &AccountId, amount: Balance) {
        // Get the current balance of the account. If not registered, panic.
        let balance = self.internal_unwrap_balance_of(account_id);

        // add the amount to the balanace and insert the new balance into the account
        if let Some(new_balance) = balance.checked_add(amount) {
            self.accounts.insert(account_id, &new_balance);
        } else {
            env::panic_str("Balance overflow");
        }
    }

    /// internal method for withdrawing some amount of FTs from account
    pub(crate) fn internal_withdraw(&mut self, account_id: &AccountId, amount: Balance) {
        // Get the current balance of the account. If not registered panic
        let balance = self.internal_unwrap_balance_of(account_id);

        // Decrease amount from the balance and insert new balance into the account
        if let Some(new_balance) = balance.checked_sub(amount) {
            self.accounts.insert(account_id, &new_balance);
        } else {
            env::panic_str("The Account doesnt have enough balance");
        }
    }

    /// Internal method for performing a transfer of FTs from one account
    ///  to another
    pub(crate) fn internal_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: &AccountId,
        amount: Balance,
        memo: Option<String>,
    ) {
        // Ensure the sender can't transfer to themselves
        require!(
            sender_id != receiver_id,
            "Sender and receiver should be different"
        );

        // Ensure the send can't transfer 0 tokens
        require!(amount > 0, "Amount should be greater than O");

        // Withdraw from the sender and deposit into the receiver
        self.internal_withdraw(sender_id, amount);
        self.internal_deposit(receiver_id, amount);

        // Emit a transfer event
        FtTransfer {
            old_owner_id: sender_id,
            new_owner_id: receiver_id,
            amount: &U128(amount),
            memo: memo.as_deref(),
        }
        .emit();
    }

    /// internal method for registering an account with the contract
    pub(crate) fn internal_register_account(&mut self, account_id: &AccountId) {
        if self.accounts.insert(account_id, &0).is_some() {
            env::panic_str("Account already registered");
        }
    }

    ///
    ///                 INTIALIZATION FUNCTION
    ///
    ///  Intenal method for measuring how many bytes it takes to insert the longest
    ///  possible account ID into our map
    ///  This will insert the account, measure the storage and remove the account.
    pub(crate) fn measure_bytes_for_longest_account_id(&mut self) {
        let initial_storage_usage = env::storage_usage();
        let tmp_account_id = AccountId::new_unchecked("a".repeat(64));
        self.accounts.insert(&tmp_account_id, &0u128);
        self.bytes_for_longest_account_id = env::storage_usage() - initial_storage_usage;
        self.accounts.remove(&tmp_account_id);
    }
}
