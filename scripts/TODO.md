# FUNGIBLE-TOKENS SCRIPTS

## [ ] Creating a fungible token

- Deploying a fungible toke and initializing it.
- metadata to define on initialization
  - Name
  - Symbol
  - Total Supply
- You also define owner who will own tokens total supply.

**1. Deploy the contract**

    near dev-deploy --wasmFile fungible_token.wasm

**2. Initialize the token with metadata** 

    near call <ft-contract> new '{"owner_id": "<owner-account>", "total_supply": "1000000000000000", "metadata": { "spec": "ft-1.0.0", "name": "Example Token Name", "symbol": "EXLT", "decimals": 8 }}' --accountId <ft-contract>

-----

## [ ] Register a user (to own and transfer tokens)
Done to allow user own and transfer tokens. You call `storage_deposit` and attach `0.00125Ⓝ`
        
    near call <ft-contract> storage_deposit '{"account_id": "<account-to-register>"}' --accountId <your-account> --amount 0.00125

    

-----

## [ ] Get Balance
Know how many coins a user has by using `balance_of`

    near view <ft-contract> ft_balance_of '{"account_id": "<users-account>"}'

`Keep in mind the decimals from the metadata. A balance of 150 FT for a token with 2 decimals actually represents 1.50 FT.`

-----

## [ ] Transferring
use `ft_transfer` method, indicating the receiver and the amount of the FT to send.

    near call <ft-contract> ft_transfer '{"receiver_id": "<receiver-account>", "amount": "<amount>"}' --accountId <your-account> --depositYocto 1

`Both sender and receiver must be registered in the FT contract`

-----

## [ ] Querying metadata
Querying the fungible tokens metadata

    near view <ft-contrac> ft_metadata

-----


## [ ] Minting
Mint fungible tokens and view them in your wallet
-----


