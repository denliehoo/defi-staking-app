const Migrations = artifacts.require('Migrations'); // dont need speciy why because of our configurations in truffle-config

module.exports = function (deployer) {
    deployer.deploy(Migrations);
};
