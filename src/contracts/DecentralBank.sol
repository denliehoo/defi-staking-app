// this dencentral bank contract takes our tether token and reward(RWD) token
pragma solidity ^0.5.0;

import "./RWD.sol";
import "./Tether.sol";

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;
    Tether public tether; // here we are setting the variable of tether to type Tether as in the smart contract
    RWD public rwd;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked; // check whether the have staked before
    mapping(address => bool) public isStaking; // check whether they are currently staking

    // because this constructor has some params, we will need to put the rwd and tether params in the future
    // if we import this contract somewhere else and use it (e.g. in 2_deploy_contract.js & decentralBank.test.js)
    constructor(RWD _rwd, Tether _tether) public {
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    // staking function; deposit tether token into the contract for staking
    // this is 3rd party hence we need to use the transferFrom function.
    function depositTokens(uint256 _amount) public {
        require(_amount > 0, "Amount must be more than 0"); // require staking amount to be >0

        //transfer tether tokens to this contract address for staking
        // from is msg.sender; i.e. the person who is interacting with this contract
        // to is the address of this contract; which we can access through the this keyword using address(this)
        // amount is a param that we must input when we use the function
        tether.transferFrom(msg.sender, address(this), _amount);

        //update staking balance
        stakingBalance[msg.sender] += _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // unstake tokens
    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance must be more than 0");

        // transfers token to the specified contract address from decentral bank address
        tether.transfer(msg.sender, balance); // we transfer it to the person interacting with the contract
        // update their staking balance to be 0
        stakingBalance[msg.sender] = 0;
        // update staking status
        isStaking[msg.sender] = false;
    }

    // issue rewards (for staking)
    function issueTokens() public {
        require(msg.sender == owner, "caller must be the owner");
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient] / 9; // /9 to create percentage incentive; they only get 1/9 of their stake token as reward tokens
            if (balance > 0) {
                rwd.transfer(recipient, balance); // the owner transfers the staker reward tokens
            }
        }
    }
}
