import { exec } from "child_process";

const deploy = (
  contract: string,
  owner_id: string,
  total_supply: string,
  token_name: string,
  token_symbol: string,
  token_decimals: number
) => {
  exec(
    `near call ${contract} new '{"owner_id":"${owner_id}", "total_supply": "${total_supply}", "metadata": {"spec": "ft-1.0.0", "name": "${token_name}", "symbol": "${token_symbol}", "decimals": ${token_decimals}}}' --accountId ${contract}`,
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

const contract = "token.wazitofc.testnet";
const owner_id = "wazitofc.testnet";
const total_supply = "1000000000000000";
const token_name = "WAZI TOKEN";
const token_symbol = "WZ1";
const token_decimals = 8;

deploy(
  contract,
  owner_id,
  total_supply,
  token_name,
  token_symbol,
  token_decimals
);
