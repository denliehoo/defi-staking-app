pragma solidity ^0.5.0;

contract Migrations {
    address public owner;
    uint256 public last_completed_migration;

    constructor() public {
        owner = msg.sender; //the person who deploys the contract
    }

    modifier restricted() {
        if (msg.sender == owner) _; //_; means continue with the function i.e. only continue if msg.sender == owner
    }

    //when we run truffle migrate, it looks for the default which is setCompleted
    function setCompleted(uint256 completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
