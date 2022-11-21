import * as nearAPI from "near-api-js";
import { InMemorySigner } from "near-api-js";
import BN from "bn.js";

import {
  AccountCreator,
  UrlAccountCreator,
} from "near-api-js/lib/account_creator";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { key_pair } from "near-api-js/lib/utils";
import { InMemoryKeyStore, KeyStore } from "near-api-js/lib/key_stores";
require("dotenv").config();

const { parseSeedPhrase, generateSeedPhrase } = require("near-seed-phrase");
const { keyStores, connect, KeyPair, Connection, utils } = nearAPI;

const PK = process.env.PK!;

const keypair = KeyPair.fromString(PK);

const myKeyStore = new keyStores.InMemoryKeyStore();
myKeyStore.setKey("testnet", "gematest.testnet", keypair);

const connection_config = {
  networkId: "testnet",
  keyStore: myKeyStore,
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

const connection = connect(connection_config);

const test = async () => {
  const public_key = keypair.getPublicKey();
  console.log(public_key);

  console.log("HERE");

  const signer = new InMemorySigner(myKeyStore);
  console.log("SIGNER: _> ", signer);

  const provider = new JsonRpcProvider({
    url: "https://rpc.testnet.near.org",
  });
  console.log("PROVIDER _>", provider);

  const connection = new Connection(
    "testnet",
    provider,
    signer,
    "jsvm.testnet"
  );

  console.log("TEST CONN _>", connection);

  // const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();
  const account = new UrlAccountCreator(
    connection,
    "https://helper.testnet.near.org"
  );
  console.log(account);

  // await account
  //   .createAccount("ngeni01.testnet", public_key)
  //   .then((res) => {
  //     console.log("ACCOUNT CREATED SUCCESSFULLY", JSON.stringify(res));
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });

  const test = new InMemoryKeyStore();

  console.log(test.getKey("testnet", "ngeni101.testnet"));

  const near_connection = await connect(connection_config);

  const acc_ount = await near_connection.account("ngeni01.testnet");

  const dets = await acc_ount.getAccessKeys();

  console.log(dets);

  const amnt = new BN("10", 24);

  await acc_ount.sendMoney("gematest.testnet", amnt).then((r) => {
    console.log(r);
  });

  // to create a seed phrase with its corresponding Keys

  // await account
  //   .createAccount("acc.gematest1.testnet", publicKey, "10000000000000000000")
  //   .then((res) => {
  //     console.log("ACCOUNT: ", res);
  //   });
};

// test();

const acc = async () => {
  const near = await connect({ ...connection_config });

  const creator_acc = await near.account("gematest.testnet");

  const key_pair = KeyPair.fromRandom("ed25519");

  console.log(key_pair);

  const public_key = key_pair.getPublicKey().toString();
  const secret_key = key_pair.toString();

  console.log({
    publicKey: public_key,
    secretKey: secret_key,
  });

  await myKeyStore.setKey("testnet", "gigo3test1.testnet", key_pair);

  const gas = new BN("30000000000000");

  const amount = utils.format.parseNearAmount("0.1");
  const attachedDeposit = new BN(amount!);

  const create_ = await creator_acc.functionCall({
    contractId: "testnet",
    methodName: "create_account",
    args: {
      new_account_id: "gigo3test1.testnet",
      new_public_key: public_key,
    },
    gas,
    attachedDeposit,
  });

  return create_;
};

// const ac = acc();

// console.log(ac);

const details = async () => {
  const acc = await (await connection).account("gigo3test1.testnet");

  const details = await acc.getAccessKeys();

  const response = await (
    await connection
  ).connection.provider.query({
    request_type: "view_access_key",
    finality: "final",
    account_id: "gematest.testnet",
    public_key: "ed25519:7ke53nLeUcxqnSs5Ln2SsB3werRSfz9g2bo1YV7xRg1n",
  });

  /**
   * Get Account basic
   */

  const signer = new InMemorySigner(myKeyStore);

  const provider = new JsonRpcProvider({
    url: "https://rpc.testnet.near.org",
  });

  const conn = nearAPI.Connection.fromConfig({
    networkId: "testnet",
    provider,
    signer,
  });

  const acc_basic = new nearAPI.Account(conn, "dontcare");

  const storage_bal = await acc_basic.viewFunction(
    "contract.gematest.testnet",
    "storage_balance_of",
    { account_id: "gematest.testnet" }
  );
  console.log("Storage Balance of GEMA conract \t => \t", storage_bal);

  const balance_of = await acc_basic.viewFunction(
    "contract.gematest.testnet",
    "ft_balance_of",
    { account_id: "gematest.testnet" }
  );
  console.log(" Balance of GEMA conract \t => \t", balance_of);

  /**
   *
   * GET LIST OF TOKENS
   *
   * @URL https://testnet-api.kitwallet.app/account/gematest.testnet/likelyTokensFromBlock
   */

  /**
   *
   * GET TRANSACTIONS
   *
   * @URL https://testnet-api.kitwallet.app/account/gematest.testnet/activity
   */
};

details();
