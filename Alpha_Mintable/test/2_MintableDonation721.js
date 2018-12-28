const MintableDonation = artifacts.require('./MintableDonation.sol');
const MintableStorage = artifacts.require('./MintableStorage.sol');
const MintableDonation721 = artifacts.require('./MintableDonation721.sol');

contract('MintableDonation721', function (accounts) {
  const owner = accounts[0];
  const FULL_DISCOUNT = 100;
  const MAX_RANDOM_DISCOUNT = 92;

  let mintableStorage;
  let mintableDonation;
  let mintableDonation721;

  before(async function() {
    mintableStorage = await MintableStorage.new();
    assert.exists(mintableStorage.address, 'MintableStorage not deployed with an address');

    mintableDonation721 = await MintableDonation721.new();
    assert.exists(mintableDonation721.address, 'MintableDonation721 not deployed with an address');

    mintableDonation = await MintableDonation.new(mintableStorage.address, mintableDonation721.address);
    assert.exists(mintableDonation.address, 'MintableDonation not deployed with an address');
  })

  describe('mint()', function () {
    it('should fail to mint from non-priviledged account', async function () {
      try {
        await mintableDonation721.mint(owner, MAX_RANDOM_DISCOUNT, {
          from: accounts[1]
        })
        assert.fail(true, 'Expected the function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected function to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully mint from priviledged address', async function () {
      await mintableDonation721.mint(accounts[1], MAX_RANDOM_DISCOUNT, {
        from: owner
      });
      await mintableDonation721.mint(owner, FULL_DISCOUNT, {
        from: owner
      });
      const tokenId = await mintableDonation721.tokenOfOwnerByIndex.call(owner, 0);
      assert.isAbove(tokenId.toNumber(), 0, 'Expected to get a valid tokenId');

      const totalSupply = await mintableDonation721.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 2, 'Expected to get a valid totalSupply');
    })
  })

  describe('setMintableDonation()', function() {
    it('should revert on accessing addMinter() ', async function () {
      try {
        await mintableDonation721.addMinter(mintableDonation.address, {
          from: owner
        })
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to setMintableDonation from non-priviliedged address', async function () {
      try {
        await mintableDonation721.setMintableDonation(mintableDonation.address, {
          from: accounts[1]
        });
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully setMintableDonation', async function () {
      await mintableDonation721.setMintableDonation(mintableDonation.address, {
        from: owner
      });
      const setmintableDonation = await mintableDonation721.mintableDonation.call();
      assert.equal(setmintableDonation, mintableDonation.address, 'Wrong address set as MintableDonation');
    });
  })
})
