pragma solidity ^0.4.24;

contract IMintableDonation721 {

  function MAX_MINT_RANDOM () external view returns (uint256);
  function MAX_MINT_FREE () external view returns (uint256);
  function FREE_DISCOUNT () external view returns (uint256);

  function MAX_RANDOM_DISCOUNT () external view returns (uint256);
  function MIN_RANDOM_DISCOUNT () external view returns (uint256);
  function TIMESTAMP_RANGE () external view returns (uint256);

  function donationRunning () external view returns (bool);

  function mintableDonation721 () external view returns (address);
  function mintableStorage () external view returns (address);

  event DonationReceived (address indexed contributor, uint256 indexed amount);

  function getDiscount (uint256 _value) external view returns (uint256);
  function deservesGift () external view returns (bool);
  function isPhase (uint256 _phase) external view returns (bool);
  function isGiftExhausted () external view returns (bool);
  function transferTokens (address _token ,address _receiver, uint256 _amount) external returns (bool);
  function transfer (address _receiver, uint256 _amount) external returns (bool);
  function toggleDonationRunning () external returns (bool);
  function setMintableStorage (address _mintableStorage) external returns (bool);
  function setMintableDonation721 (address _mintableDonation721) external returns (bool);
  function donate (address _mintableDonation721) external payable;
  function () external payable;
}
