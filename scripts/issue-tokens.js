const DecentralBank = artifacts.require('DecentralBank');

// callback function is a function that calls it self
module.exports = async function issueRewards(callback) {
    let decentralBank = await DecentralBank.deployed();
    await decentralBank.issueTokens(); //calls issue tokens from the contract
    console.log("Tokens has been issued successfully");
    callback()
}

// to run the script in the console:
// truffle exec scripts/issue-tokens.js