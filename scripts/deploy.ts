import { exec } from "child_process";

const deploy = (account_id: string) => {
  exec(
    `near deploy --accountId ${account_id} --wasmFile ../contracts/token_contract/target/wasm32-unknown-unknown/release/token_contract.wasm`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }

      console.log("-----".repeat(20));
      console.log("Deploying token contract");
      console.log("------".repeat(20));
      console.log(`stdout: ${stdout} \n \n`);
    }
  );
};

const account_id = "token.wazitofc.testnet";

deploy(account_id);
