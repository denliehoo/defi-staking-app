require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1:', // from ganache
            port: '7545',
            network_id: '*' // * means connect to any network
        },
    },
    contracts_directory: './src/contracts', // folder location of contracts
    contracts_build_directory: './src/truffle_abis',
    compilers: {
        solc: { // our compiler is solidity
            version: '^0.5.0', //means any solidity version above 0.5.0
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }

}