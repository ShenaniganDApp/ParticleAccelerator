/* eslint-disable consistent-return */
const fs = require("fs");
const fetch = require("node-fetch");
const BigNumber = require("bignumber.js");
const dotenv = require("dotenv");
const transaction = require("../config/dao.json");
const { tokensToMint } = require("../config/schedule.json");

const AGENT_ADDRESS = "0x5cb045fd63f95c208048c38e0abd2cdb3537c68e";

(async function () {
  dotenv.config();
  const providersFile =
    "https://raw.githubusercontent.com/ShenaniganDApp/ParticleAccelerator/master/data/providers.json";

  let providers = await (await fetch(providersFile)).json();
  let {
    pair: { totalSupply },
  } = providers[0];

  function timeRewards() {
    const miningStartTime = process.env.MINING_START_TIME;

    const agent = providers.find(
      (element) => element.user.address === AGENT_ADDRESS
    );
    if (agent) {
      providers = providers.filter(
        (element) => element.user.address !== agent.user.address
      );
      totalSupply -= agent.liquidityTokenBalance;
    }
    // Calculate rewards
    const providerRewards = providers.map((element) => [
      element.user.address,
      new BigNumber(element.liquidityTokenBalance)
        .dividedBy(totalSupply)
        .multipliedBy(+element.timestamp / +miningStartTime),
    ]);

    let total = 0; // Variable to hold your total

    for (let i = 0, len = providerRewards.length; i < len; i += 1) {
      total += +providerRewards[i][1]; // Iterate over your first array and then grab the second element add the values up
    }

    const normalizedRewards = providerRewards.map((reward) => [
      reward[0],
      reward[1]
        .dividedBy(total)
        .multipliedBy(tokensToMint)
        .toFixed(18)
        .toString(),
    ]);

    return normalizedRewards;
  }
  function mintSettings(tx) {
    const providerMints = timeRewards();

    // Save to file marked today
    const now = new Date().toISOString().split("T")[0];
    fs.writeFile(
      `./log/rewards-${now}.json`,
      JSON.stringify(providerMints),
      (err) => {
        if (err) {
          console.log("Did not save transaction settings");
          console.log(err);
        }
      }
    );

    // Cut decimals for transaction
    providerMints.map((provider) => provider[1].replace(".", ""));
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
})();
