use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::Base64VecU8;
use near_sdk::near_bindgen;
use near_sdk::serde::{Deserialize, Serialize};

use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Clone, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct FungibleTokenMetadata {
    pub spec: String, // should be ft-1.0.0 to indicate that a ft contract adhere to the current metadata version
    pub name: String, // human readable name of token
    pub symbol: String, // EG WETH, SUDA
    pub icon: Option<String>,
    pub reference: Option<String>, // link to a valid JSON file containing various keys offering supplementary details on the token
    pub reference_hash: Option<Base64VecU8>, // base64-encoded sha256 hash of the JSON file containeed in the reference field.
    pub decimals: u8,
}

pub trait FungibleTokenMetadataProvider {
    // View call for returning the contract metadata
    fn ft_metadata(&self) -> FungibleTokenMetadata;
}

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}
