//! GEMA Token contract entrypoint
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, StorageUsage};

pub mod events;
pub mod ft_core;
pub mod internal;
pub mod metadata;
pub mod storage;

use crate::events::*;
use crate::metadata::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    /// Keep track of each account's balances
    pub accounts: LookupMap<AccountId, Balance>,

    /// Total Supply of all tokens
    pub total_supply: Balance,

    /// The bytes for the larges possible account ID that can be registered
    pub bytes_for_longest_account_id: StorageUsage,

    /// Metadata
    pub metadata: LazyOption<FungibleTokenMetadata>,
}

/// Helper structure for keys of persistent collection
#[derive(BorshSerialize)]
pub enum StorageKey {
    Accounts,
    Metadata,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract with the given total supply owned by the given onwer id with given ft metadata
    #[init]
    pub fn new(owner_id: AccountId, total_supply: U128, metadata: FungibleTokenMetadata) -> Self {
        // Create a variable of type Self with all fields initialized
        let mut this = Self {
            total_supply: total_supply.0,
            bytes_for_longest_account_id: 0,
            accounts: LookupMap::new(StorageKey::Accounts.try_to_vec().unwrap()),
            metadata: LazyOption::new(StorageKey::Metadata.try_to_vec().unwrap(), Some(&metadata)),
        };

        // Measure the bytes for the longest accountID and store it in the contract
        this.measure_bytes_for_longest_account_id();

        // register the owner's account and set their bal ot the the total supply
        this.internal_register_account(&owner_id);
        this.internal_deposit(&owner_id, total_supply.into());

        // Emit an event showing that the FTs were minted
        FtMint {
            owner_id: &owner_id,
            amount: &total_supply,
            memo: Some("Initial token supply is minted"),
        }
        .emit();

        this
    }
}
