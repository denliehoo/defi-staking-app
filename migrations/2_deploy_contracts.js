const Tether = artifacts.require('Tether'); // dont need speciy why because of our configurations in truffle-config
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

//async await because we need to wait for Tether contratracts etc do be deployed first (?)
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Tether); //deploy  tether contract
    const tether = await Tether.deployed(); // allows us to access the things in tether contract

    await deployer.deploy(RWD); //deploy RWD contract
    const rwd = await RWD.deployed();

    // deploy DecentralBank contract; wait whats with the other 2 ?? *****
    // in DecentralBank.sol: constructor(RWD _rwd, Tether _tether) public {...}
    // When we deploy we set the variable types of the contracts which are Tether and RWD to tether and rwd because this is a better convention as a variable. We differentiate so as to separate the contracts being imported and deployed to be stored into variables which is a smart way to keep
    // We deploy the whole contracts (rwd and tether) and store them to variables which contain object information hence why we can grab rwd.address
    // also, we need to first put DecentralBank and then the 2 other variables 
    await deployer.deploy(DecentralBank, rwd.address, tether.address);
    const decentralBank = await DecentralBank.deployed();

    //Transfer all RWD tokens to Decentral Bank
    // .transfer is a function defined in the rwd contract which accepts adddress and value as the params (refer to RWD.sol)
    await rwd.transfer(decentralBank.address, '1000000000000000000000000')

    //distributes 100 Tether tokens to investors
    await tether.transfer(accounts[1], '100000000000000000000')

};