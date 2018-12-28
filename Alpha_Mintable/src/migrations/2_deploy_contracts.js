var ERC721Generator = artifacts.require("./ERC721Generator.sol");

module.exports = function(deployer) {

  deployer.deploy(ERC721Generator, {gas: 5000000});
};
