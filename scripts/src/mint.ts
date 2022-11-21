import { exec } from "child_process";

const deploy = (account_id: string, receiver_id: string, amount: string) => {
  exec(
    `near call ${account_id} ft_mint '{"receiver_id": "${receiver_id}", "amount": "${amount}"}' --deposit 0.1 --accountId ${receiver_id}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }

      console.log("-----".repeat(20));
      console.log(`minting ${amount} to ${receiver_id}`);
      console.log("------".repeat(20));
      console.log(`stdout: ${stdout} \n \n`);
    }
  );
};

const account_id = "test-1.gematest.testnet";
const receiver_id = "gematest.testnet";
const amount = "1000";

deploy(account_id, receiver_id, amount);
