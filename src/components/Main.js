import React, { Component } from 'react'
import tether from '../tether.png'

class Main extends Component {
    render() {
        // console.log(this.props.stakingBalance)
        return (
            <div id='content' className='mt-3'>
                <table className='table text-muted text-center'>
                    <thead>
                        <tr style={{ color: 'black' }}>
                            <th scope='col'>Staking Balance</th>
                            <th scope='col'>Reward Balance</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ color: 'black' }}>
                            {/* convert the number from ether to number i.e. from 18 0s to just 1 etc */}
                            <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} USDT</td>
                            <td>{window.web3.utils.fromWei(this.props.rwdBalance, 'Ether')} RDW</td>
                        </tr>
                    </tbody>
                </table>
                <div className='card mb-2' style={{ opacity: '.9' }}>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault(); // because usually when submit the page will refresh; this prevents it
                            let amount = window.web3.utils.toWei(this.input.value.toString(), 'Ether'); //this.input.value takes the current value in the input form before submission
                            this.props.stakeTokens(amount)

                        }}
                        className='mb-3'>
                        <div style={{ borderSpacing: '0 1em' }}>
                            <label className='float-left' style={{ marginLeft: '15px' }}>
                                <b>Stake Tokens</b>
                            </label>
                            <span className="float-right" style={{ marginRight: '8px' }}>
                                Balance: {window.web3.utils.fromWei(this.props.tetherBalance, 'Ether')}
                            </span>
                            <div className='input-group mb-4'>
                                <input type='text'
                                    placeholder='0'
                                    ref={(input) => { this.input = input }}
                                    required />
                                <div className='input-group-open'>
                                    <div className='input-group-text'>
                                        <img alt='tether' src={tether} height='32' />
                                        &nbsp;&nbsp;&nbsp;USDT
                                    </div>
                                </div>
                            </div>
                            <button type='submit' className='btn btn-primary btn-lg btn-block'>DEPOSIT</button>
                        </div>
                    </form>
                    <button
                        className='btn btn-primary btn-lg btn-block'
                        type='submit'
                        onClick={(event) => {
                            event.preventDefault(
                                this.props.unstakeTokens()
                            )
                        }}
                    >WITHDRAW</button>
                    <div className='card-body text-center' style={{ color: 'blue' }}>
                        AIRDROP
                    </div>
                </div>
            </div>

        )
    }
}

export default Main;