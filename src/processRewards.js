/* eslint-disable consistent-return */
const fs = require("fs");
const BigNumber = require("bignumber.js");
const providers = require("../providers.json");
const transaction = require("../config/dao.json");
const { tokensToMint } = require("../config/schedule.json");

function mintSettings(tx) {
  const providerAddresses = providers.map((element) => element.user.address);
  const providerTokens = providers.map(
    (element) => element.liquidityTokenBalance
  );
  const providerRewards = providerTokens.map((element) =>
    new BigNumber(element)
      .dividedBy(100)
      .multipliedBy(tokensToMint)
      .toFixed(18)
      .toString()
      .replace(".", "")
  );
  const providerMints = providerAddresses.map((element, i) => [
    element,
    providerRewards[i],
  ]);

  const settings = tx;
  settings[0].mints = providerMints;

  return JSON.stringify(settings, null, 2);
}

/**
 * Entry point to the `processGrain.js` script
 * @returns <Promise>
 */
const rewards = () => {
  try {
    if (providers.length < 1) {
      console.log("this should never happen");
      throw new Error("`addressbook.json` is empty");
    }

    // *** HARD CODED ***
    fs.writeFile(
      "./log/transactionSettings.json",
      mintSettings(transaction),
      (err) => {
        if (err) {
          console.log("Did not save transaction settings");
          console.log(err);
        }
      }
    );
    return "file sucessfully written";
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
};

console.log(mintSettings(transaction));
console.log(rewards());
