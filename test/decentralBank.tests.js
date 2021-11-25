/// Note: folder name must be "test". This is because Mocha will automatically look for the "test" folder. 
// the good thing about using these tests is that we dont need to deploy it to test.
// instead, we can just do in our console:
// truffle test
// and it will compile and test the code written here (even if it is not deployed)
// why we wna do this is because deploying contracts costs ETH and it'll also be hard to update already deployed contracts
// hence, we use these tests instead.  

const Tether = artifacts.require('Tether'); // dont need speciy why because of our configurations in truffle-config
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// contract accepts 2 params
// first is the name (?)
// second is an annonymous function. In this case, it accepts an annoymous function with the params accounts
contract('DecentralBank', (accounts) => {
    // All code goes here for testing

    let tether, rwd, decentralBank;

    function tokens(num) {
        return web3.utils.toWei(num, 'ether')
    }

    // any code in the before function will run first before anything (can be placed anywhere)
    before(async () => {
        // Load contracts
        tether = await Tether.new()   // new Tether instance     
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        // Transfers all tokens to DecentralBank (1million)
        await rwd.transfer(decentralBank.address, tokens('1000000'))

        //transfer 100 tokens to the investor
        /* We passed an object as the third parameter to transfer.
        Note that the transfer function in our Solidity contract (in Tether.sol) doesn't have a third parameter.
        Instead, it is a special object that can always be passed as the last parameter to a function that lets
        you edit specific details about the transaction ("transaction params").
        Here, we set the from address ensuring this transaction came from accounts[0].
        The transaction params that you can set correspond to the fields in an Ethereum transaction:*/
        await tether.transfer(accounts[1], tokens('100'), { from: accounts[0] })

    })

    // describe is the description of the test name;
    // it is the description of each of the test in the test; we can have multiple its
    // assert will help us with the it
    describe('Mock Tether Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await tether.name();
            assert.equal(name, 'Mock Tether Token')
        })
    })

    describe('Reward Token Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await rwd.name();
            assert.equal(name, 'Reward Token')
        })
    })

    describe('Decentral Bank Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await decentralBank.name();
            assert.equal(name, 'Decentral Bank')
        })

        it('contract has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Yield Farming', async () => {
        it('reward tokens for staking', async () => {
            let result;
            // check investor balance
            result = await tether.balanceOf(accounts[1])
            assert.equal(result.toString(), tokens('100'), 'customer mock wallet balance before staking')

            //check staking for customer of 100 tokens
            await tether.approve(decentralBank.address, tokens('100'), { from: accounts[1] }) //need approve first since its a transferFrom; simulation of approval
            await decentralBank.depositTokens(tokens('100'), { from: accounts[1] })

            // check updated balance of customer; should be 0 since they staked it all
            result = await tether.balanceOf(accounts[1])
            assert.equal(result.toString(), tokens('0'), 'customer mock wallet balance after staking')

            // check updated balance of decentralbank; should be 100
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('100'), 'balance of decentral bank after staking from customer')

            // check the is staking balance; should be true
            result = await decentralBank.isStaking(accounts[1])
            assert.equal(result.toString(), 'true', 'customer is staking status after staking should be true')

            // issue tokens
            await decentralBank.issueTokens({ from: accounts[0] })

            // ensure only owner can issue tokens; where owner is accounts[0]. this, if its [1], then it should be rejected 
            await decentralBank.issueTokens({ from: accounts[1] }).should.be.rejected;

            // unstaking the tokens....
            // check unstake tokens function
            await decentralBank.unstakeTokens({ from: accounts[1] })

            // check unstaking balances
            result = await tether.balanceOf(accounts[1])
            assert.equal(result.toString(), tokens('100'), 'customer mock wallet balance after unstaking')

            // check updated balance of decentralbank after unstaking; should be 0
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('0'), 'balance of decentral bank after unstaking from customer')

            // check the updated is staking balance; should be false
            result = await decentralBank.isStaking(accounts[1])
            assert.equal(result.toString(), 'false', 'customer is staking status after unstaking should be false')
        })

    })

})