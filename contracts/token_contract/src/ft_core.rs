use near_sdk::{assert_one_yocto, ext_contract, Gas, PromiseOrValue, PromiseResult};

use crate::*;

const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(5_000_000_000_000);
const GAS_FOR_FT_TRANSFER_CALL: Gas = Gas(25_000_000_000_000);

#[ext_contract(ext_ft_core)]
pub trait FungibleTokenCore {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);

    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128>;

    fn ft_total_supply(&self) -> U128;

    fn ft_balance_of(&self, account_id: AccountId) -> U128;
}

#[near_bindgen]
impl FungibleTokenCore for Contract {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        // Assert that user attached exactly 1 yoctoNEAR
        assert_one_yocto();

        // sender - user who called the method
        let sender_id = env::predecessor_account_id();

        // How many tokens the user wants to transfer
        let amount: Balance = amount.into();

        // Trnansfer the tokens
        self.internal_transfer(&sender_id, &receiver_id, amount, memo);
    }

    #[payable]
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128> {
        // Assert that user attached exactly 1 yoctoNEAR
        assert_one_yocto();

        let sender_id = env::predecessor_account_id();

        let amount: Balance = amount.into();

        self.internal_transfer(&sender_id, &receiver_id, amount, memo);

        // initiating receiver's call and callback
        // Defaulting Gas weight to 1, no attached deposit and Static GAS equal to the GAS for ft transfer call
        ext_ft_receiver::ext(receiver_id.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER_CALL)
            .ft_on_transfer(sender_id.clone(), amount.into(), msg)
            // We then resolve the promise and call ft_resolve_transfer on our own contract
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                    .ft_resolve_transfer(&sender_id, receiver_id, amount.into()),
            )
            .into()
    }

    fn ft_total_supply(&self) -> U128 {
        // Return the total supplu casted to a U128
        self.total_supply.into()
    }

    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        // Return the balance of the account casted to U128
        self.accounts.get(&account_id).unwrap_or(0).into()
    }
}

#[ext_contract(ext_ft_receiver)]
pub trait FungibleTokenReciever {
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128>;
}

#[near_bindgen]
impl Contract {
    #[private]
    pub fn ft_resolve_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) -> U128 {
        let amount: Balance = amount.into();

        // Get the unused amount from the `ft_on_transfer` call result.
        let unused_amount = match env::promise_result(0) {
            PromiseResult::NotReady => env::abort(),

            // If promise was successful, get the return value and cast it to U128
            PromiseResult::Successful(value) => {
                // if we can properly parse the value, the unused amount is equal to whatever is smaller (unused / original amount)
                // else, if we can't properly pass the value, the original amount is returned

                if let Ok(unused_amount) = near_sdk::serde_json::from_slice::<U128>(&value) {
                    std::cmp::min(amount, unused_amount.0)
                } else {
                    amount
                }
            }

            // If promise wasn't successful, return the original amount
            PromiseResult::Failed => amount,
        };

        // if there is some unused amount, we should refund the sender
        if unused_amount > 0 {
            //Get receiver's balance. We can only refund sender if receiver has enough balance
            let receiver_balance = self.accounts.get(&receiver_id).unwrap_or(0);

            if receiver_balance > 0 {
                // The amnt to refund is the smaller b2 used amnt and receivers bal as we can only refund upto what the receiver currently has
                let refund_amount = std::cmp::min(receiver_balance, unused_amount);

                // Refund the sender for the unused amount
                self.internal_transfer(
                    &receiver_id,
                    &sender_id,
                    refund_amount,
                    Some("Refund".to_string()),
                );

                // Return what was actually used
                let unused_amount = amount
                    .checked_sub(refund_amount)
                    .unwrap_or_else(|| env::panic_str("Total supply overflow"));

                return unused_amount.into();
            }
        }

        // if the unused amount is 0, return the original amount.
        amount.into()
    }
}
