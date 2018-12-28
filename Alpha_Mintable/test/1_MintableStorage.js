const MintableStorage = artifacts.require('./MintableStorage.sol');
const NULL_ADDRESS = 0x0000000000000000000000000000000000000000;
const ETHER = Math.pow(10, 18);

contract('MintableStorage', function (accounts) {
  const owner = accounts[0];
  const approvedContracts = accounts.filter((contract,index) => index > 0 && index < 4);
  let mintableStorage;

  before(async () => {
      mintableStorage = await MintableStorage.new();
      assert(mintableStorage.address, "Failed to deploy MintableStorage with an address.");
  });

  describe ('setApprovedContract()', function() {
    it('should fail to setApprovedContract from non-owner address', async function () {
      try {
        await mintableStorage.setApprovedContract(approvedContracts[0], true, {
          from: accounts[2]
        })
        assert.fail(true, 'function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should fail to setApprovedContract own address', async function () {
      try {
        await mintableStorage.setApprovedContract(owner, true, {
          from: owner
        })
        assert.fail(true, 'function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully setApprovedContract from owner address', async function () {
      await Promise.all(
        approvedContracts.map((contract) => {
          return mintableStorage.setApprovedContract( contract, true, {
            from: owner
          })
        })
      );
      const approved = await Promise.all(
        approvedContracts.map((contract) => {
          return mintableStorage.approvedStorageUsers.call( contract, {
            from: owner
          })
        })
      );
      const expected = [ true, true, true ];
      assert.deepEqual(approved, expected, 'Not all contracts were successfully added');
    })
  });

  describe ('addTokensArray()', function() {
    it('should fail to addTokensArray from non-priviledged account', async function() {
      try {
        await mintableStorage.addTokensArray(accounts[5], {
          from: accounts[4]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should fail to addTokensArray null address', async function() {
      try {
        await mintableStorage.addTokensArray(NULL_ADDRESS, {
          from: accounts[1]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should fail to addTokensArray own address', async function() {
      try {
        await mintableStorage.addTokensArray(accounts[1], {
          from: accounts[1]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully addTokensArray', async function () {
      const totalGenerated = await mintableStorage.totalGenerated.call();
      await Promise.all(
        approvedContracts.map(async (approvedContract, index) => {
          const totalUserTokens = await mintableStorage.totalUserTokens.call(approvedContract);
          assert.isAtMost(totalUserTokens.toNumber(), 0, 'Approved contract ('+approvedContract+') already has some tokens');

          return mintableStorage.addTokensArray( accounts[index+4], {
            from: approvedContract
          })
        })
      );
      const addedTokens = approvedContracts.length;
      const newTotalGenerated = await mintableStorage.totalGenerated.call();
      assert.deepEqual(newTotalGenerated, totalGenerated.plus(addedTokens), 'Not all Tokens were successfully added');
    })
  });

  describe ('addVIP()', function() {
    it('should fail to addVIP from non-priviledged account', async function() {
      try {
        const isVIP = await mintableStorage.VIPsupporters(accounts[7]);
        assert.isFalse(isVIP, 'Address is already VIP');

        await mintableStorage.addVIP(accounts[7], {
          from: accounts[4]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully addVIP', async function () {
      const isVIP = await mintableStorage.VIPsupporters(accounts[7]);
      assert.isFalse(isVIP, 'Address is already VIP');

      await mintableStorage.addVIP(accounts[7], {
        from: accounts[1]
      })
      const isNowVIP = await mintableStorage.VIPsupporters(accounts[7]);
      assert.isTrue(isNowVIP, 'Address not successfully set as VIP');
    })
  })

  describe ('setMintFee()', function() {
    const newMintFee = 0.001 * ETHER;
    it('should fail to setMintFee from non-priviledged account', async function() {
      try {
        const MintFee = await mintableStorage.MintFee.call();
        assert.isAtMost(MintFee.toNumber(), 0, 'MintFee default is greater than Zero(0)');

        await mintableStorage.setMintFee(newMintFee, {
          from: approvedContracts[0]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.fail((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully setMintFee', async function () {
      const mintFee = await mintableStorage.MintFee.call();
      assert.isAtMost(mintFee.toNumber(), 0, 'MintFee default is greater than Zero(0)');

      await mintableStorage.setMintFee(newMintFee, {
        from: owner
      })
      const setMintFee = await mintableStorage.MintFee.call();
      assert.strictEqual(setMintFee.toNumber(), newMintFee, 'MintFee incorrectly set');
    })
  })

  describe ('setExchangeFee()', function() {
    const newExchangeFee = 0.001 * ETHER;
    it('should fail to setExchangeFee from non-priviledged account', async function() {
      try {
        const MintFee = await mintableStorage.ExchangeFee.call();
        assert.isAtMost(ExchangeFee.toNumber(), 0, 'ExchangeFee default is greater than Zero(0)');

        await mintableStorage.setExchangeFee(newExchangeFee, {
          from: approvedContracts[0]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully setExchangeFee', async function () {
      const mintFee = await mintableStorage.ExchangeFee.call();
      assert.isAtMost(mintFee.toNumber(), 0, 'ExchangeFee default is greater than Zero(0)');

      await mintableStorage.setExchangeFee(newExchangeFee, {
        from: owner
      })
      const setExchangeFee = await mintableStorage.ExchangeFee.call();
      assert.strictEqual(setExchangeFee.toNumber(), newExchangeFee, 'ExchangeFee incorrectly set');
    })
  })

  describe ('setMinimumGiftDonation()', function() {
    const newsetMinimumGiftDonation = 0.001 * ETHER;
    it('should fail to setsetMinimumGiftDonation from non-priviledged account', async function() {
      try {
        const MinimumGiftDonation = await mintableStorage.MinimumGiftDonation.call();
        assert.isAtMost(setMinimumGiftDonation.toNumber(), 0.5 * ETHER, 'setMinimumGiftDonation default is greater than Zero(0)');

        await mintableStorage.setMinimumGiftDonation(newsetMinimumGiftDonation, {
          from: approvedContracts[0]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully setMinimumGiftDonation', async function () {
      const minimumGiftDonation = await mintableStorage.MinimumGiftDonation.call();
      assert.isAtMost(minimumGiftDonation.toNumber(), 0.5 * ETHER, 'setMinimumGiftDonation default is greater than Zero(0)');

      await mintableStorage.setMinimumGiftDonation(newsetMinimumGiftDonation, {
        from: owner
      })
      const setMinimumGiftDonation = await mintableStorage.MinimumGiftDonation.call();
      assert.strictEqual(setMinimumGiftDonation.toNumber(), newsetMinimumGiftDonation, 'MinimumGiftDonation incorrectly set');
    })
  })

  describe ('addToArray()', function() {
    const bytesToAdd = [
      '0x001',
      '0x002',
      '0x003',
      '0x004',
      '0x005'
    ];
    const ArrayNames = {
      Array1: 0,
      Array2: 1,
      Array3: 2,
      Array8: 7,
      Array9: 8
    }

    it('should fail to addToArray from non-priviledged account', async function() {
      try {
        const array1Length = await mintableStorage.fetchArrayLength.call(ArrayNames.Array1);
        assert.isAtMost(array1Length.toNumber(), 0, 'Array1 length is greater than Zero(0)');

        await mintableStorage.addToArray(ArrayNames.Array1, bytesToAdd[0], {
          from: accounts[4]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should fail to fetchArrayLength from non-accessible Array', async function() {
      try {
        const array9Length = await mintableStorage.fetchArrayLength.call(ArrayNames.Array9);
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should fail to addToArray to non-accessible Array', async function() {
      try {
        await mintableStorage.addToArray(ArrayNames.Array8, bytesToAdd[0], {
          from: approvedContracts[1]
        })
        assert.fail(true, 'Function should fail');
      } catch(e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it('should successfully addToArray', async function () {
      let arrayToAdd = {};
      Object.keys(ArrayNames).map((key, index) => index > 2 ? '' : arrayToAdd[key] = ArrayNames[key]);

      const addToArray = await Promise.all(
        approvedContracts.map(async (approvedContract) => {
          return await Promise.all(Object.keys(arrayToAdd).map(async (toAdd) => {
            return Promise.all(bytesToAdd.map(async(bytes) => {
              await mintableStorage.addToArray(arrayToAdd[toAdd], bytes, {
                from: approvedContract
              });
            }))
          }))
        })
      );

      const arrayLengths = await Promise.all(
        Object.keys(arrayToAdd).map(async (toAdd) => {
          return (await mintableStorage.fetchArrayLength(arrayToAdd[toAdd])).toNumber();
        })
      );

      const expectedLengths = Object.keys(arrayToAdd).map( (toAdd) => {
          return bytesToAdd.length * approvedContracts.length;
      });

      assert.deepEqual(arrayLengths, expectedLengths, 'Wrong number of Items added to Arrays');
    })
  })
})
