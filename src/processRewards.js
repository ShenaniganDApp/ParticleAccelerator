/* eslint-disable consistent-return */
const fs = require('fs');
const BigNumber = require('bignumber.js');
let providers = require('../providers.json');
const transaction = require('../config/dao.json');
const { tokensToMint } = require('../config/schedule.json');

function mintSettings(tx) {
	let {
		pair: { totalSupply },
	} = providers[0];

	const agent = providers.find((element) => element.user.address === '0x5cb045fd63f95c208048c38e0abd2cdb3537c68e');
	if (agent) {
		providers = providers.filter((element) => element.user.address !== agent.user.address);
		totalSupply = totalSupply - agent.liquidityTokenBalance;
	}

	//Combine addresses with token balances
	const providerAddresses = providers.map((element) => element.user.address);
	const providerTokens = providers.map((element) => element.liquidityTokenBalance);

	//Calculate rewards
	const providerRewards = providerTokens.map((element) =>
		new BigNumber(element).dividedBy(totalSupply).multipliedBy(tokensToMint).toFixed(18).toString()
	);
	const providerMints = providerAddresses.map((element, i) => [element, providerRewards[i]]);

	// Save to file marked today
	const now = new Date().toISOString().split('T')[0];
	fs.writeFile(`./log/rewards-${now}.json`, JSON.stringify(providerMints), (err) => {
		if (err) {
			console.log('Did not save transaction settings');
			console.log(err);
		}
	});

	//Cut decimals for transaction
	providerMints.forEach((provider) => (provider[1] = provider[1].replace('.', '')));
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
			console.log('this should never happen');
			throw new Error('`addressbook.json` is empty');
		}

		// *** HARD CODED ***
		fs.writeFile('./log/transactionSettings.json', mintSettings(transaction), (err) => {
			if (err) {
				console.log('Did not save transaction settings');
				console.log(err);
			}
		});
		return 'file sucessfully written';
	} catch (err) {
		console.error(err);
		process.exit(-1);
	}
};

console.log(mintSettings(transaction));
console.log(rewards());
