const MintableDonation721 = artifacts.require('./MintableDonation721.sol');
const MintableDonation = artifacts.require('./MintableDonation.sol');
const MintableStorage = artifacts.require('./MintableStorage.sol');
const ERC721Generator = artifacts.require('./ERC721Generator.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'test') {
    return;
  }

  let storage;
  let donation;
  let donation721;
  let generator;
  await deployer.deploy(MintableStorage)
  .then(function (instance) {
    storage = instance;
  });
  deployer.link(MintableStorage, MintableDonation, ERC721Generator);

  await deployer.deploy(MintableDonation721)
  .then(function (instance) {
    donation721 = instance;
  });
  deployer.link(MintableDonation721, MintableDonation);

  await deployer.deploy(MintableDonation, MintableStorage.address, MintableDonation721.address)
    .then(function (instance) {
      donation = instance;
    })

  await deployer.deploy(ERC721Generator, MintableStorage.address, {
    gas:5750000
  })
  .then(function (instance) {
    generator = instance;
  });

  await storage.setApprovedContract(MintableDonation.address, true);
  await storage.setApprovedContract(ERC721Generator.address, true);
  await donation721.setMintableDonation(MintableDonation.address);
  await generator.setStorageContract(MintableStorage.address);
}
