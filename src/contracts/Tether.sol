pragma solidity ^0.5.0;

contract Tether {
    string public name = "Mock Tether Token";
    string public symbol = "mUSDT";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens; 18 0 =1 ; +6 more 0 = 1 million
    uint8 public decimals = 18; // because decimals are 18

    // indexed allows outside consumers (e.g. through web3.js) to filter through the addresses so we can search for them
    // although it will also cost a higher gas. Hence, we can only use 3 indexed per event.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner, //from will be from the owner
        address indexed _spender, // to will be to the spender
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    /* mapping an address to the mapping of an address to a uint; i.e. smth like this
    address: {
        address: uint
    }
    then, to access the uint value; need do allowance[address1][address2]
    allowance helps us with our Approval event & approve function
    */
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
    }

    // function will return a boolean called success which is true or false
    // this transfer token is for the contract owner to send the fake tether to other users
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // require that the value is greater or equal for transfer
        require(balanceOf[msg.sender] >= _value);
        // transfer the amount and subtract the balance
        balanceOf[msg.sender] -= _value;
        // add the balance
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // the person who is currently connecting to the contract (spender) is equal to the value
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transfeFrom is for users who want to transfer the fake tether
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // ensure value being sent is less than the balance of the address that is sending
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_to] += _value;
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}

/* 
transfer vs transferFrom
transfer is just from us to the smart contract (we;re doing the transfer)
transferFrom is another entity transferring from us to them (3rd party); then, we will
need to approve this transfer to them
(e.g. for transferFrom, imagine we are using our bank card to buy something.
The shop can't just take it from our bank account, instead, this 3rd party makes a "request"
to spend on our behalf and then we approve the spending)
(conversely, for transfer, we are the ones spending it e.g. me just doing a bank transfer to someone)

in short:
transfer : we are making the transfer on our own (e.g. transferring from our account to another account)
transferFrom: someone is making the transfer on our behalf and we need to approve (e.g. when we add liquidity to liquidity pools or stake)
*/
