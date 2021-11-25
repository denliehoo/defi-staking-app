// in our index.js, we imported bootstrap, and hence we can use bootstrap in our classes globally 

import React, { Component } from 'react'
import Navbar from './Navbar';
import Web3 from 'web3';
import Tether from '../truffle_abis/Tether.json' //we import from the abis and not the contract itself; this also gives us all the functions available in the contract
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'
import Main from './Main.js'



class App extends Component {

    async UNSAFE_componentWillMount() { // ???? wtf is this
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() { // window is a global variable
        if (window.ethereum) { //if in our window, we detect ethereum (metamask)
            window.web3 = new Web3(window.ethereum) // create a new instance of web3
            await window.ethereum.enable() // enable it and await for it to be enabled (approve)
        } else if (window.web3) { // if we find another different provider that is not metamask 
            window.web3 = new Web3(window.web3.currentProvider) // use the current provider (that isnt metamask)
        } else {
            window.alert('No ethereum browser detected; check out metamask')
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        const account = await web3.eth.getAccounts();
        // set the state of the account to be the address interacting with metamask
        this.setState({ account: account[0] }) // in this case, when we interact with metamask, we get an array of only 1 address, hence we do account[0]
        const networkId = await web3.eth.net.getId() // the 5777 from ganache or whatever we are using

        //load tether contract
        const tetherData = Tether.networks[networkId]
        if (tetherData) { //if true
            // web3.eth.Contract wants 2 params - the abi and the contract address
            const tether = new web3.eth.Contract(Tether.abi, tetherData.address)
            this.setState({ tether }) // this is basically {tether: tether}
            // since we are now using web3, when we use the functions defined in our contract, we need to do .methods.xxx() first
            // e.g. previously we could just do tether.balanceOf() now we need to do tether.methods.balanceof()
            // furthermore, we need to use the .call() for web3. 
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
            this.setState({ tetherBalance: tetherBalance.toString() })
            // console.log({ balance: tetherBalance })
        } else { // if no network...
            window.alert('Error, Tether Contract not deployed; No detected network!')
        }

        // Load RWD contract
        const rwdData = RWD.networks[networkId]
        if (rwdData) { //if true
            const rwd = new web3.eth.Contract(RWD.abi, rwdData.address)
            this.setState({ rwd })
            let rwdBalance = await rwd.methods.balanceOf(this.state.account).call()
            this.setState({ rwdBalance: rwdBalance.toString() })
        } else { // if no network...
            window.alert('Error, RWD Contract not deployed; No detected network!')
        }

        // load DecentralBank contract
        const decentralBankData = DecentralBank.networks[networkId]
        if (decentralBankData) { //if true
            const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address)
            this.setState({ decentralBank })
            let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
            this.setState({ stakingBalance: stakingBalance.toString() })
        } else { // if no network...
            window.alert('Error, Decentral Bank Contract not deployed; No detected network!')
        }

        this.setState({ loading: false });

    } //end of async loadBlockchainData() function

    // staking & unstaking function (from our decentralBank contract - deposit tokens and unstaking)
    /* for staking:
     depositTokens transferFrom ...
     fuunction to approve the transaction hash before actually depositting
    staking function: access decentralBank.depositTokens(send transactionHash) */
    // staking function
    stakeTokens = (amount) => {
        this.setState({ loading: true }) // we change the loading to true first while we load the transaction
        // we need to approve method first (as in the decentralBank); the approver is the decentralBank address .
        // then we do .send and say who is sending the tokens (from). We set this to this.state.account which is the address interacting w/ the contract through their metamask
        // what is .on again?******* find out
        this.state.tether.methods.approve(this.state.decentralBank._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
            // take the depositToken() function from denctralBank ; when we do use the function, need put .methods.
            this.state.decentralBank.methods.depositTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
                this.setState({ loading: false }) // change back loading to false
            })
        })
    }

    // unstaking functions
    // note this unstakes all the tokens
    unstakeTokens = () => {
        this.setState({ loading: true })
        // dont need do approval from decentralBank as this isnt a 3rd party transfer; however this sitll does require approval from metamask (which is done automatically)
        // use the .unstateTokens() function in the dencentralBank contract; once again from is the person who is interacting with the contract through metamask
        this.state.decentralBank.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
            this.setState({ loading: false })
        })
    }


    // this.state grabs the state ; this.setState sets the state
    // this is the "default"  state
    constructor(props) {
        super(props)
        this.state = { //initializing the values as 0 and also the contracts as an empty object first
            account: '0x0',
            tether: {},
            rwd: {},
            decentralBank: {},
            tetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            loading: true
        }
    }


    render() {
        const content = this.state.loading ?
            <p id='loader' className='text-center' style={{ margin: '30px' }}>LOADING...</p> :
            <Main
                tetherBalance={this.state.tetherBalance}
                rwdBalance={this.state.rwdBalance}
                stakingBalance={this.state.stakingBalance}
                stakeTokens={this.stakeTokens}
                unstakeTokens={this.unstakeTokens} />

        return (
            <div>
                <Navbar account={this.state.account} />
                {/* mt-5 means margin top 5 ml means margin left mr means margin right */}
                <div className='container-fluid mt-5'>
                    <div className="row">
                        <main role='main' className='col-lg-12 ml-auto mr-auto' style={{ maxWidth: '600px', minHeight: '100vm' }}>
                            <div>
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default App;



/* to run the project
npm start      // starts the webpage
truffle migrate --reset      // might not be neccesary
ensure that metamask is conencted and that we are on the correct account + correct chain (ganache) + connected to the correct ganache
*/

