const MintableStorage = artifacts.require('./MintableStorage.sol');
const ERC721Generator = artifacts.require('./ERC721Generator.sol');
const ERC721FullMintable = artifacts.require('./ERC721FullMintable.sol');
const MintableDonation721 = artifacts.require('./MintableDonation721.sol');

const NULL_ADDRESS = 0x0000000000000000000000000000000000000000;
const ETHER = Math.pow(10, 18);

contract('ERC721Generator', function (accounts) {

  const TOKEN_CREATED_EVENT = 'erc721Created';
  const TOKEN_TRANSFER_EVENT = 'Transfer';
  const FULL_DISCOUNT = 100;
  const MIN_RANDOM_DISCOUNT = 5;
  const MAX_RANDOM_DISCOUNT = 92;
  const RANDOM_DISCOUNT = Math.floor((MAX_RANDOM_DISCOUNT + MIN_RANDOM_DISCOUNT) * Math.random()) + MIN_RANDOM_DISCOUNT;

  const owner = accounts[0];
  const approvedContracts = accounts.filter((contract,index) => index > 0 && index < 4);
  const storageMintFee = 0.05 * ETHER;

  let mintableStorage;
  let mintableDonation721;
  let eRC721Generator;

  before(async function() {
        mintableStorage = await MintableStorage.new();
        assert(mintableStorage.address, "Failed to deploy MintableStorage with an address.");

        eRC721Generator = await ERC721Generator.new(NULL_ADDRESS, NULL_ADDRESS, {
          gas: 5750000,
          from: owner
        });
        assert(eRC721Generator.address, "Failed to deploy ERC721Generator with an address.");

        const storageAddress = await eRC721Generator.Storage.call();
        assert.equal(storageAddress, NULL_ADDRESS, 'Wrong address set as storageContract');

        await mintableStorage.setApprovedContract(eRC721Generator.address, true, {
          from: owner
        });
        const approvedStorageuser = await mintableStorage.approvedStorageUsers.call(eRC721Generator.address);
        assert.isTrue(approvedStorageuser, 'ERC721Generator not successfully set as approvedStorageUer');

        await mintableStorage.setMintFee(storageMintFee, {
          from: owner
        });
        const setMintFee = await mintableStorage.MintFee.call();
        assert.equal(setMintFee.toNumber(), storageMintFee, 'ERC721Generator not successfully set as approvedStorageUser');

        mintableDonation721 = await MintableDonation721.new();
        assert.exists(mintableDonation721.address, 'MintableDonation721 not deployed with an address');
  });

  describe('changeOwner()', function () {
    it('should fail to changeOwner from non-priviledged account', async function () {
        try{
            await eRC721Generator.changeOwner( accounts[1], {
              from: accounts[2]
            })
            assert.fail(true, 'Expected function to fail');
        } catch (e) {
            assert.exists(e.message || e, 'Expected function to fail with error');
            assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
        }
    });

    it('should changeOwner',  async function () {
        await eRC721Generator.changeOwner( accounts[1], {
          from: owner
        })
        const newOwner = await eRC721Generator.owner.call();
        assert.equal(newOwner, accounts[1], 'Failed to successfully changeOwner');

        await eRC721Generator.changeOwner( owner, {
          from: accounts[1]
        })
        const finalNewOwner = await eRC721Generator.owner.call();
        assert.equal(finalNewOwner, owner, 'Failed to successfully changeOwner');
    });
  });

  describe('setStorageContract', function () {
    it('should fail to setStorageContract from non-owner', async function () {
      try {
        await eRC721Generator.setStorageContract(mintableStorage.address, {
          from: accounts[2]
        });
        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully setStorageContract', async function () {
      await eRC721Generator.setStorageContract(mintableStorage.address, {
        from: owner
      });
      const storageContract = await eRC721Generator.Storage.call();
      assert.equal(storageContract, mintableStorage.address, 'Wrong address set as storageContract');
    });

    it('should fail to overwrite StorageContract', async function () {
      try {
        await eRC721Generator.setStorageContract(mintableStorage.address, {
          from: owner
        });
        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });
  });

  describe('setMintableDonation721', function () {
    it('should fail to setMintableDonation721 from non-owner', async function () {
      try {
        await eRC721Generator.setMintableDonation721(mintableDonation721.address, {
          from: accounts[2]
        });
        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully setMintableDonation721', async function () {
      await eRC721Generator.setMintableDonation721(mintableDonation721.address, {
        from: owner
      });
      const donation721Token = await eRC721Generator.mintableDonation721.call();
      assert.equal(donation721Token, mintableDonation721.address, 'Wrong address set as storageContract');
    });

    it('should fail to overwrite mintableDonation721Contract', async function () {
      try {
        await eRC721Generator.setMintableDonation721(mintableDonation721.address, {
          from: owner
        });
        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });
  });

  describe('toggleOnlineStatus()', function () {
    it('should fail to toggleOnlineStatus from non-owner address', async function () {
      try {
        await eRC721Generator.toggleOnlineStatus({
          from: accounts[1]
        });
        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully toggleOnlineStatus()', async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();

      await eRC721Generator.toggleOnlineStatus({
        from: owner
      });

      const newOnlineStatus = await eRC721Generator.isOnline.call();
      assert.notEqual(newOnlineStatus, onlineStatus, 'Online status not successfully toggled');
    });
  });

  describe('createERC721', function () {
    const token = {
      name: 'Test token',
      symbol: 'TTN',
      url: 'ipfs://token/object',
      metadata: [
        'we',
        'are',
        'champions'
      ]
    }
    before(async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();
      if (onlineStatus) {
        await eRC721Generator.toggleOnlineStatus({
          from: owner
        });
      }
      const newOnlineStatus = await eRC721Generator.isOnline.call();
      assert.isFalse(newOnlineStatus, 'Failed to turn Generator offline');
    });

    it('should fail to createERC721 when offline', async function () {
      try {
        await eRC721Generator.createERC721(
          token.name,
          token.symbol,
          token.url,
          {
            from:accounts[2]
          }
        );
        assert.fail(true, 'Expected transaction to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to createERC721 without Fee or discount', async function () {
      try {
        // const
        const onlineStatus = await eRC721Generator.isOnline.call();
        if (!onlineStatus) {
          await eRC721Generator.toggleOnlineStatus({
            from: owner
          });
        }
        const newOnlineStatus = await eRC721Generator.isOnline.call();
        assert.isTrue(newOnlineStatus, 'Failed to turn Generator offline');

        await eRC721Generator.createERC721(
          token.name,
          token.symbol,
          token.url,
          {
            from:accounts[2]
          }
        );
        assert.fail(true, 'Expected transaction to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to createERC721Metadata without Fee or discount', async function () {
      try {
        // const
        const onlineStatus = await eRC721Generator.isOnline.call();
        if (!onlineStatus) {
          await eRC721Generator.toggleOnlineStatus({
            from: owner
          });
        }
        const newOnlineStatus = await eRC721Generator.isOnline.call();
        assert.isTrue(newOnlineStatus, 'Failed to turn Generator offline');

        await eRC721Generator.createERC721Metadata(
          token.name,
          token.symbol,
          token.url,
          token.metadata[0],
          token.metadata[1],
          token.metadata[2],
          {
            from:accounts[2]
          }
        );
        assert.fail(true, 'Expected transaction to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully createERC721', async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();
      assert.isTrue(onlineStatus, 'Generator not online');

      const creation = await eRC721Generator.createERC721(
        token.name,
        token.symbol,
        token.url,
        {
          from:accounts[4],
          value: storageMintFee
        }
      );
      const newContract = creation.logs[0].args._newContract;
      assert.equal(creation.logs[0].event, TOKEN_CREATED_EVENT, 'Failed to fire Token created event');
      assert.exists(newContract, 'Token created event has no Token address');

      const erc721 = await ERC721FullMintable.at(newContract);
      const newTokenName = await erc721.name.call();
      assert.equal(newTokenName, token.name, 'Token created with incorrect name');
    });

    it('should successfully createERC721Metadata', async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();
      assert.isTrue(onlineStatus, 'Generator not online');

      const creation = await eRC721Generator.createERC721Metadata(
        token.name,
        token.symbol,
        token.url,
        token.metadata[0],
        token.metadata[1],
        token.metadata[2],
        {
          from:accounts[3],
          value: storageMintFee
        }
      );
      const newContract = creation.logs[0].args._newContract;
      assert.equal(creation.logs[0].event, TOKEN_CREATED_EVENT, 'Failed to fire Token created event');
      assert.exists(newContract, 'Token created event has no Token address');

      const erc721 = await ERC721FullMintable.at(newContract);
      const newTokenName = await erc721.name.call();
      assert.equal(newTokenName, token.name, 'Token created with incorrect name');

      const newTokenMetadata = await erc721.fetchData.call(0);
      assert.deepEqual(newTokenMetadata, token.metadata, 'Token created with incorrect metadata');
    });

    it('should successfully createERC721 with Discount', async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();
      assert.isTrue(onlineStatus, 'Generator not online');

      const mintReceipt = await mintableDonation721.mint(accounts[4], FULL_DISCOUNT, {
        from: owner
      });
      const tokenId = mintReceipt.logs[0].args.tokenId.toNumber();
      const setDiscount = await mintableDonation721.getDiscount.call(tokenId);
      assert.equal(mintReceipt.logs[0].event, TOKEN_TRANSFER_EVENT, 'Token Mint event not fired');
      assert.equal(setDiscount.toNumber(), FULL_DISCOUNT, 'Incorrect discount allocated to address');

      const creation = await eRC721Generator.createERC721(
        token.name,
        token.symbol,
        token.url,
        {
          from:accounts[4],
        }
      );
      const newContract = creation.logs[0].args._newContract;
      assert.equal(creation.logs[0].event, TOKEN_CREATED_EVENT, 'Failed to fire Token created event');
      assert.exists(newContract, 'Token created event has no Token address');

      const erc721 = await ERC721FullMintable.at(newContract);
      const newTokenName = await erc721.name.call();
      assert.equal(newTokenName, token.name, 'Token created with incorrect name');
    });

    it('should successfully createERC721Metadata with discount', async function () {
      const onlineStatus = await eRC721Generator.isOnline.call();
      assert.isTrue(onlineStatus, 'Generator not online');

      const mintReceipt = await mintableDonation721.mint(accounts[5], FULL_DISCOUNT, {
        from: owner
      });
      const tokenId = mintReceipt.logs[0].args.tokenId.toNumber();
      const setDiscount = await mintableDonation721.getDiscount.call(tokenId);
      assert.equal(mintReceipt.logs[0].event, TOKEN_TRANSFER_EVENT, 'Token Mint event not fired');
      assert.equal(setDiscount.toNumber(), FULL_DISCOUNT, 'Incorrect discount allocated to address');

      const creation = await eRC721Generator.createERC721Metadata(
        token.name,
        token.symbol,
        token.url,
        token.metadata[0],
        token.metadata[1],
        token.metadata[2],
        {
          from:accounts[5],
          value: storageMintFee*((100-RANDOM_DISCOUNT)/100)
        }
      );
      const newContract = creation.logs[0].args._newContract;
      assert.equal(creation.logs[0].event, TOKEN_CREATED_EVENT, 'Failed to fire Token created event');
      assert.exists(newContract, 'Token created event has no Token address');

      const erc721 = await ERC721FullMintable.at(newContract);
      const newTokenName = await erc721.name.call();
      assert.equal(newTokenName, token.name, 'Token created with incorrect name');

      const newTokenMetadata = await erc721.fetchData.call(0);
      assert.deepEqual(newTokenMetadata, token.metadata, 'Token created with incorrect metadata');
    });
  });
});
