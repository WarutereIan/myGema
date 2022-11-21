use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, log, AccountId, Balance, Promise};

use crate::*;

// The structure that will be returned for the methods:
// * `storage_deposit`
// * `storage_withdraw`
// * `storage_balance_of`

///
/// `total` and `available`
/// values are string representations of U128 showing the balance of a specific account in yoctoNEAR
///
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct StorageBalance {
    pub total: U128,
    pub available: U128,
}

///
/// returned for the method `storage_balance_bounds`
///
/// `min` -> amount of tokes required to start using this contract
///
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct StorageBalanceBounds {
    pub min: U128,
    pub max: Option<U128>,
}

pub trait StorageManagement {
    ///
    /// CHANGE METHODS ON FT
    ///

    // Returns the Storage balance stucture showing updated balance
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance;

    ///
    ///  VIEW METHODS
    ///

    // Returns min and max allowed balance amount to intereact with this contract.
    fn storage_balance_bounds(&self) -> StorageBalanceBounds;

    // Returns minimum and max allowed balance amounts to interact with contract
    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance>;
}

#[near_bindgen]
impl StorageManagement for Contract {
    #[allow(unused_variables)]
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        // Get the amount of NEAR to deposit
        let amount: Balance = env::attached_deposit();

        // If an account was specified, use that, otherwise, use predecessor account
        let account_id = account_id.unwrap_or_else(env::predecessor_account_id);

        //if account already registered, refund the deposit
        if self.accounts.contains_key(&account_id) {
            log!("A/C already registered");
            if amount > 0 {
                Promise::new(env::predecessor_account_id()).transfer(amount);
            }
            //Register the account and refund excess near
        } else {
            // Get the minimum required storage and ensure the deposit is atleast that amount
            let min_balance = self.storage_balance_bounds().min.0;

            if amount < min_balance {
                env::panic_str("The attached deposit is less than min req deposit");
            }

            // Register the account
            self.internal_register_account(&account_id);

            // Perform a refund
            let refund = amount - min_balance;
            if refund > 0 {
                Promise::new(env::predecessor_account_id()).transfer(refund);
            }
        }

        // Return the storage balance of the account
        StorageBalance {
            total: self.storage_balance_bounds().min,
            available: 0.into(),
        }
    }

    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        // Calculate the required storage balance by taking the bytes
        let required_storage_balance =
            Balance::from(self.bytes_for_longest_account_id) * env::storage_byte_cost();

        // Storage balance bounds will have min == max == required_storage_balance
        StorageBalanceBounds {
            min: required_storage_balance.into(),
            max: Some(required_storage_balance.into()),
        }
    }

    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        // Get the storage balance of the account
        if self.accounts.contains_key(&account_id) {
            Some(StorageBalance {
                total: self.storage_balance_bounds().min,
                available: 0.into(),
            })
        } else {
            None
        }
    }
}
