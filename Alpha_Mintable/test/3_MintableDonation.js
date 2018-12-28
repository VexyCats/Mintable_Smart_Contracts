const MintableDonation = artifacts.require('./MintableDonation.sol');
const MintableStorage = artifacts.require('./MintableStorage.sol');
const MintableDonation721 = artifacts.require('./MintableDonation721.sol');

contract('MintableDonation', function (accounts) {

  const MINT_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  const ETHER = Math.pow(10, 18);

  const FULL_DISCOUNT = 100;
  const MIN_DISCOUNT = 2;
  const MAX_DISCOUNT = 92;

  const owner = accounts[0];

  let mintableStorage;
  let mintableDonation;
  let mintableDonation721;

  before(async function() {
    mintableStorage = await MintableStorage.new();
    assert.exists(mintableStorage.address, 'MintableStorage not deployed with an address');

    mintableDonation721 = await MintableDonation721.new();
    assert.exists(mintableDonation721.address, 'MintableDonation721 not deployed with an address');

    mintableDonation = await MintableDonation.new(NULL_ADDRESS, NULL_ADDRESS);
    assert.exists(mintableDonation.address, 'MintableDonation not deployed with an address');

    mintableDonation721.setMintableDonation(mintableDonation.address);

    const setMintableDonation = await mintableDonation721.mintableDonation.call();
    assert.equal(setMintableDonation, mintableDonation.address ,'Incorrect mintableDonation addresss set');


    await mintableStorage.setApprovedContract(mintableDonation.address, true);
    const approvedStorageuser = await mintableStorage.approvedStorageUsers.call(mintableDonation.address);
    assert.isTrue(approvedStorageuser, 'MintableDonation not successfully set as approvedStorageUer');
  });

  describe('setMintableStorage()', function() {
    it('should fail to setMintableStorage from non-priviliedged address', async function () {
      try {
        await mintableDonation.setMintableStorage(mintableStorage.address, {
          from: accounts[1]
        })
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully to setMintableStorage', async function () {
      const prevMintableStorage = await mintableDonation.mintableStorage.call();
      assert.equal(prevMintableStorage, NULL_ADDRESS, 'MintableStorage already set');

      await mintableDonation.setMintableStorage(mintableStorage.address, {
        from: owner
      })

      const setMintableStorage = await mintableDonation.mintableStorage.call();
      assert.equal(setMintableStorage, mintableStorage.address, 'Wrong address set as MintableStorage');
    })

    it('should fail to overwrite MintableStorage', async function () {
      try {
        const prevMintableStorage = await mintableDonation.mintableStorage.call();
        assert.notEqual(prevMintableStorage, NULL_ADDRESS, 'MintableStorage not yet set');

        await mintableDonation.setMintableStorage(mintableStorage.address, {
          from: owner
        })
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })
  });

  describe('setMintableDonation721()', function() {
    it('should fail to setMintableDonation721 from non-priviliedged address', async function () {
      try {
        await mintableDonation.setMintableDonation721(mintableDonation721.address, {
          from: accounts[1]
        })
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
      }
    })

    it('should successfully to setMintableDonation721', async function () {
      const prevMintableDonation721 = await mintableDonation.mintableDonation721.call();
      assert.equal(prevMintableDonation721, NULL_ADDRESS, 'MintableDonation721 already set');

      await mintableDonation.setMintableDonation721(mintableDonation721.address, {
        from: owner
      })

      const setMintableDonation721 = await mintableDonation.mintableDonation721.call();
      assert.equal(setMintableDonation721, mintableDonation721.address, 'Wrong address set as MintableDonation721');
    })

    it('should fail to overwrite MintableDonation721', async function () {
      try {
        const prevMintableDonation721 = await mintableDonation.mintableDonation721.call();
        assert.notEqual(prevMintableDonation721, NULL_ADDRESS, 'MintableDonation721 not yet set');

        await mintableDonation.setMintableDonation721(mintableDonation721.address, {
          from: owner
        })
        assert.fail(true, 'Function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })
  });

  describe('toggleDonationRunning()', function () {
    it('should fail to toggleDonationRunning from non-priviledged address', async function () {
      try {
        await mintableDonation.toggleDonationRunning({
          from: accounts[1]
        });

        assert.fail(true, 'Expected function to fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected transaction to fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })


    it('should successfully toggleDonationRunning', async function () {
      const prevDonationRunning = await mintableDonation.donationRunning.call();

      await mintableDonation.toggleDonationRunning({
        from: owner
      });

      const setDonationRunning = await mintableDonation.donationRunning.call();
      assert.notEqual(setDonationRunning, prevDonationRunning, 'donationRunning not successfully toggled');
    })
  });

  describe('donate()', function () {
    const EVENT = 'DonationReceived';

    it('should successfully fail to donate Zero(0)', async function () {
      try {
        const tx = await mintableDonation.sendTransaction({
          from: accounts[2]
        });
        assert.notExists(true, 'Expeceted transaction to fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expeceted transaction to fail with an error');
      }
    });

    it('should successfully donate from fallback function', async function () {
      const tx = await mintableDonation.sendTransaction({
        value: 0.2* ETHER,
        from: accounts[2]
      });
      assert.equal(tx.logs[0].event, EVENT, 'Donation event was not fired ');
    });

    it('should successfully use donate function', async function () {
      const tx = await mintableDonation.donate({
        value: 0.2* ETHER,
        from: accounts[3]
      });
      assert.equal(tx.logs[0].event, EVENT, 'Donation event was not fired ');
    });

    it('should successfully become a VIPeee', async function () {
      const isVIP = await mintableStorage.VIPsupporters.call(accounts[2]);
      assert.isFalse(isVIP, 'Address is already VIP');

      const tokenExists = await mintableDonation721.tokenIdExists.call(0);
      assert.isFalse(tokenExists, 'Gift token already exist');

      const balance = await mintableDonation.contract._eth.getBalance(accounts[2]);
      assert.isAbove(balance.toNumber(), 0.5 * ETHER, 'Address has insufficient balance');

      const tx = await mintableDonation.donate({
        value: 0.5* ETHER,
        from: accounts[2]
      });
      assert.equal(tx.logs[0].event, EVENT, 'Donation event was not fired ');

      const isVIPsupporters = await mintableStorage.VIPsupporters.call(accounts[2]);
      assert.isTrue(isVIPsupporters, 'Address not declared VIP');

      const mintEvent = tx.receipt.logs.find(log => log.topics[0] === MINT_EVENT_TOPIC);
      assert.exists(mintEvent, 'Failed to fire Mint event');

      const Web3 = require('web3');
      const ABI = new Web3(web3.currentProvider).eth.abi;

      const tokenId = ABI.decodeParameter('uint256', mintEvent.topics[3]);

      const newTokenExists = await mintableDonation721.tokenIdExists.call(tokenId);
      assert.isTrue(newTokenExists, 'Gift token Id does not exist');

      const discount = await mintableDonation721.getDiscount.call(tokenId);
      assert.equal(discount.toNumber(), FULL_DISCOUNT, 'Wrong discount allocated to the token');

      const expectedData = {
        0: String(FULL_DISCOUNT),
        1: String(tokenId),
        2: ''
      };

      const truffleContracts = require('truffle-contract');
      const _MintableDonation721 = artifacts.require('./MintableDonation721');
      const truffleContract = await truffleContracts(MintableDonation721);
      truffleContract.setProvider(web3.currentProvider);
      const instance = await truffleContract.at(mintableDonation721.address);
      const odadata = await instance.fetchData.call(tokenId);

      Object.keys(expectedData).map(one => {
        (expectedData[one] === '0') ?
        assert.isTrue(one in odadata && odadata[one] === '', 'Incorrect information from FetchData')
          :
        assert.isTrue(one in odadata && odadata[one] === expectedData[one], 'Incorrect information from FetchData');
      });

      // TODO investigate reason direct artifact does not support fetchData
      // const data = await mintableDonation721.fetchData.call(tokenId);
      // console.log(data);
      //
      // const ddata = await MintableDonation721.at(mintableDonation721.address).fetchData.call(tokenId);
      // console.log(ddata)
      //
      // assert.deepEqual(data, expectedData, 'Incorrect information from FetchData');
    });
  });

  describe('transferTokens()', function () {
    let dummyToken;
    const mintTokens = 100 * ETHER;

    before(async function() {
      const DUMMYTOKEN = artifacts.require('./DummyToken.sol');
      dummyToken =  await DUMMYTOKEN.new();

      const tokenBalance = await dummyToken.balanceOf.call(mintableDonation.address);
      assert.isAtMost(tokenBalance.toNumber(), 0, 'mintableDonation already owns tokens');

      await dummyToken.mint(mintableDonation.address, mintTokens);
      const newTokenBalance = await dummyToken.balanceOf.call(mintableDonation.address);
      assert.equal(newTokenBalance.toNumber(), mintTokens, 'Wrong tokens sent to mintableDonation');
    })

    it('should fail to transferTokens from non-priviledged account', async function () {
      try {
        await mintableDonation.transferTokens(dummyToken.address, accounts[6], mintTokens, {
          from: accounts[3]
        });
        assert.fail(true, 'Expected transaction to fail');
      } catch (e) {
        assert.exists(e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully transferTokens', async function () {
      const tokenBalance = await dummyToken.balanceOf.call(accounts[6]);

      await mintableDonation.transferTokens(dummyToken.address, accounts[6], mintTokens, {
        from: owner
      });

      const newTokenBalance = await dummyToken.balanceOf.call(accounts[6]);
      assert.deepEqual(newTokenBalance, tokenBalance.plus(mintTokens), 'Wrong number of tokens transferred');
    });
  });

  describe('transfer()', function () {
    it('should fail to transfer ETH from non-priviledged account', async function () {
      try {
        const donated = await mintableDonation.contract._eth.getBalance(mintableDonation.address);
        assert.isAbove(donated.toNumber(), 0, 'Donation vault empty.');

        await mintableDonation.transfer(account[5],  donated.toNumber(),{
          from: accounts[1]
        })
        assert.fail(true, 'Expected transaction to fail');
      } catch (e) {
        assert.exists(e, 'Expected transaction to fail with error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully transfer ETH', async function () {
      const donated = await mintableDonation.contract._eth.getBalance(mintableDonation.address);
      assert.isAbove(donated.toNumber(), 0, 'Donation vault empty.');

      const balance = await mintableDonation.contract._eth.getBalance(account[5]);

      await mintableDonation.transfer(account[5],  donated.toNumber(),{
        from: owner
      });

      const newBalance = await mintableDonation.contract._eth.getBalance(account[5]);

      assert.deepEqual(newBalance, balance.plus(donated), 'Wrong amount transferred to recipient');
    });
  });
})
