pragma solidity ^0.4.24;

import './ERC20Basic.sol';
import './IMintableStorage.sol';
import './SafeMath.sol';
import './Ownable.sol';
import './IMintableDonation721.sol';

contract MintableDonation is Ownable{
  using SafeMath for uint256;

  uint256 constant public MAX_MINT_RANDOM = 10000;
  uint256 constant public MAX_MINT_FREE = 1000;
  uint256 constant public FREE_DISCOUNT = 100;

  uint256 constant public MAX_RANDOM_DISCOUNT = 92;//Maximum possible psuedoRandom disvcount
  uint256 constant public MIN_RANDOM_DISCOUNT = 5;//Minimum possible psuedoRandom disvcount
  uint256 constant public TIMESTAMP_RANGE = 255;//Minimum possible psuedoRandom disvcount

  bool public donationRunning = false;

  enum discountPhases { free, random }

  IMintableDonation721 public mintableDonation721;
  IMintableStorage public mintableStorage;

  event DonationReceived (address indexed contributor, uint256 indexed amount);

  constructor (address _mintableStorage, address _mintableDonation721)
    public
  {
    setMintableStorage(_mintableStorage);
    setMintableDonation721(_mintableDonation721);
  }

  function getDiscount ()
    public view
  returns (uint256) {
    if (isPhase(discountPhases.free)) {

      return FREE_DISCOUNT;
    } else {
      //Discount
      uint256 discount;
      uint256 blockNumber = block.number - (block.timestamp%TIMESTAMP_RANGE);
      discount = (uint256(keccak256(blockhash(blockNumber)))%(MAX_RANDOM_DISCOUNT.sub(MIN_RANDOM_DISCOUNT))).add(MIN_RANDOM_DISCOUNT);

      return discount;
    }
  }

  function deservesGift ()
    public view
  returns (bool) {
    return msg.value >= mintableStorage.MinimumGiftDonation();
  }

  function isPhase (discountPhases _phase)
    public view
  returns(bool) {
    if (_phase == discountPhases.free) {
      return mintableDonation721.totalSupply() < MAX_MINT_FREE;
    } else if (_phase == discountPhases.random) {
      return mintableDonation721.totalSupply() >= MAX_MINT_FREE && mintableDonation721.totalSupply() < MAX_MINT_RANDOM.add(MAX_MINT_FREE);
    } else {
      return false;
    }
  }

  function isGiftExhausted ()
    public view
  returns (bool) {
    return mintableDonation721.totalSupply() >= MAX_MINT_RANDOM.add(MAX_MINT_FREE);
  }

  function transferTokens (address _token ,address _receiver, uint256 _amount)
    public onlyOwner
  returns (bool) {
    ERC20Basic(_token).transfer(_receiver, _amount);
    return true;
  }

  function transfer (address _receiver, uint256 _amount)
    public onlyOwner
  returns (bool) {
    _receiver.transfer(_amount);
    return true;
  }

  function toggleDonationRunning ()
    public onlyOwner
  returns (bool){
    donationRunning = !donationRunning;
  }

  function setMintableStorage (address _mintableStorage)
    public onlyOwner
  returns (bool) {
    require(address(mintableStorage) == 0x0, 'MintableStorage already set');
    mintableStorage = IMintableStorage(_mintableStorage);
    return address(mintableStorage) == _mintableStorage;
  }

  function setMintableDonation721 (address _mintableDonation721)
    public onlyOwner
  returns (bool) {
    require(address(mintableDonation721) == 0x0, 'MintableDonation721 already set');
    mintableDonation721 = IMintableDonation721(_mintableDonation721);
    return true;
  }

  function _mintSingleGift ()
    internal
  returns (bool) {
    require (!isGiftExhausted(), 'All Gifts distributed');
    return mintableDonation721.mint(msg.sender, getDiscount());
  }

  function donate ()
    public payable
  {
    require(msg.value > 0, 'Donation value must be greater than Zero');

    if (deservesGift()) {
      mintableStorage.addVIP(msg.sender);

      if (!isGiftExhausted() && donationRunning) {
        require(_mintSingleGift(), 'Failed to mint Gift token');
      }
    }
    emit DonationReceived(msg.sender, msg.value);
  }

  function ()
    public payable
  {
    donate();
  }


}
