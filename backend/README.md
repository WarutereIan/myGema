# BACKEND

[endpoints]
  [wallet]
  [authentication]

## FOLDER STRUCTURE

![task image](https://miro.medium.com/max/700/1*xu6sBN2e6ExZS68FS83hgQ.png)

`A top-level ../`src`/ folder layout for the gema backend`

    .
    ├── controllers
    │   ├── Auth 
    │   └── Wallet
    │
    ├── middlewares
    │   ├── Auth 
    │   └── Wallet
    │
    ├── routes
    │   
    ├── models
    │   ├── Auth 
    │   └── Wallet
    │
    ├── services
    │   ├── Auth 
    │   └── Wallet
    │
    ├── helpers
    │
    ├── docs
    │
    ├── routes
    │   
    ├── test                    # Test files (alternatively `spec` or `tests`)
    │   ├── benchmarks          # Load and stress tests
    │   ├── integration         # End-to-end, integration tests (alternatively `e2e`)
    │   └── unit                # Unit tests 
    │            
    ├── LICENSE
    └── README.md

## TODO: => TASK LIST

![:fire:](https://clockify.me/blog/wp-content/uploads/2021/02/How-to-be-more-efficient-with-tasks-cover.png)

- [x] `src` folder structure setup :file_folder:

- [x] Setup [Express](https://expressjs.com/)
  - [x] `app.ts` with necessary middlewares
  - [x] `server.ts` with localhost connection

- [x] Setup Database
  - [x] connection to [MongoDB](https://mongoosejs.com/docs/guide.html)
  - [x] [models setup](https://drive.google.com/file/d/1ULlVZWXzEQKs-64rxO-lp-LQqvBBTK0w/view?usp=sharing) :face_in_clouds:
    - [x] `wallet`
    - [x] `user`
    - [x] `transactions`
    - [x] `tokens`

---

- [x] Wallet Module :moneybag:
  - [x] Create Wallet
  - [x] Store info to MongoDB
    - ( `private key, public key, accountId, memonic?` )
  - [x] Get Wallet Info
    - [x] Balance
    - [x] Tokens
    - [x] Transactions
  - [x] Transfer Tokens
  - [x] SwapTokensForTokens
  - [x] SwapTokensForGEM

---
> **THE TASKS ABOVE HAVE A DEADLINE OF `MONDAY, 12.09.2022`**
