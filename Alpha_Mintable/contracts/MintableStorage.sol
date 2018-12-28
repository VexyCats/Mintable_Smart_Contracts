pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Ownable.sol";

contract MintableStorage is Ownable {

    /*******************************
     * Mintable storage contract
     * Each Mapping has a key via byte32
     *
     *
     *
     *
     *
     *
     *
     *
     * ****************************/


   /**
   * @dev Checks for a pre-condition
   * @param condition bool the condition you want to be tested
   */
     // PRE, POST CONDITIONS
     modifier pre_cond(bool condition) {
        require(condition, 'Failed to meet Pre conditions');
        _;
    }
    using SafeMath for uint256;

    uint256 constant public ONE = 1;
     //public array of all tokens made by this contract
    address[] public tokensArray;
    //tracking total contracts created
    uint256 public totalGenerated = 0;
    //takes an address and returns an array of the token IDs in which they own
    mapping(address => uint256[]) public ownedTokens;
    //Mapping to hold the contracts allowed to update state on the storage contract
    mapping(address => bool) public approvedStorageUsers;
    //checks and stores VIP users, that have donated
    mapping(address => bool) public VIPsupporters;
    //Current cost to Mint
    uint256 public MintFee;
   //Cost for Exchange
   uint256 public ExchangeFee;
   //Minimum doantion to receive gift from Donation contract
   uint256 public MinimumGiftDonation = 500 finney;
   //Extra storage arrays
   bytes32[] public Array1;
   bytes32[] public Array2;
   bytes32[] public Array3;
   bytes32[] public Array4;
   bytes32[] public Array5;
   bytes32[] public Array6;
   bytes32[] public Array7;
   bytes32[] internal Array8;
   bytes32[] internal Array9;
   bytes32[] internal Array10;

   enum ArrayNames { Array1, Array2, Array3, Array4, Array5, Array6, Array7, Array8, Array9, Array10 }
   // event ItemStored(address indexed _sender, bytes32 indexed _data);

   constructor()
    public
  {
       approvedStorageUsers[msg.sender] = true;
   }

   function addTokensArray(address _newAddress) public
   pre_cond(approvedStorageUsers[msg.sender])
   returns (bool){
       require(_newAddress != address(0), 'Can not set null address');
       require(_newAddress != address(msg.sender), 'Can not add own address as Token address');
       tokensArray.push(_newAddress);
       totalGenerated = totalGenerated.add(ONE);
       ownedTokens[msg.sender].push(totalGenerated);
       return true;
   }

   function setApprovedContract(address _newContract, bool _approval) public
   onlyOwner
   returns (bool){
       require(_newContract != address(msg.sender), 'Cannot set own address as ApprovedContract');
      approvedStorageUsers[_newContract] = _approval;
       return true;
   }

   function addVIP(address _supporter) public
   pre_cond(approvedStorageUsers[msg.sender])
   returns (bool){
      //require(_supporter != address(msg.sender));
      VIPsupporters[_supporter] = true;
       return true;
   }

   function setMintFee(uint256 _fee) public
   onlyOwner
   returns (bool){
      MintFee = _fee;
      return true;
   }

   function setExchangeFee(uint256 _fee) public
   onlyOwner
   returns (bool){
      ExchangeFee = _fee;
      return true;
   }

   function setMinimumGiftDonation(uint256 _fee) public
   onlyOwner
   returns (bool){
      MinimumGiftDonation = _fee;
      return true;
   }

   function addToArray (ArrayNames _arrayName, bytes32 _content) public
   pre_cond(approvedStorageUsers[msg.sender])
   returns (bool) {
     if (_arrayName == ArrayNames.Array1) {
       Array1.push(_content);
     } else if (_arrayName == ArrayNames.Array2) {
       Array2.push(_content);
     } else if (_arrayName == ArrayNames.Array3) {
       Array3.push(_content);
     } else if (_arrayName == ArrayNames.Array4) {
       Array4.push(_content);
     } else if (_arrayName == ArrayNames.Array5) {
       Array5.push(_content);
     } else if (_arrayName == ArrayNames.Array6) {
       Array6.push(_content);
     } else if (_arrayName == ArrayNames.Array7) {
       Array7.push(_content);
     } else {
       revert('Array does not exist, or is not accessible');
     }
     return true;
   }

   function totalUserTokens(address _user) public view
   returns (uint256 _totalTokens) {
     return ownedTokens[_user].length;
   }

   function getUserTokens(address _user) public view
   returns (uint256[]) {
     return ownedTokens[_user];
   }

   function fetchInternalArray (ArrayNames _arrayName) public view onlyOwner
   returns (bytes32[]) {
     if (_arrayName == ArrayNames.Array8) {
       return Array8;
     } else if (_arrayName == ArrayNames.Array9) {
       return Array9;
     } else if (_arrayName == ArrayNames.Array10) {
       return Array10;
     } else {
       revert('Array does not exist, or is not accessible');
     }
   }

   function fetchInternalArrayItem (ArrayNames _arrayName, uint256 _index) public view onlyOwner
   returns (bytes32) {
     return fetchInternalArray(_arrayName)[_index];
   }

   function fetchArrayLength (ArrayNames _arrayName) public view
   returns (uint256 _length) {
     if (_arrayName == ArrayNames.Array1) {
       return Array1.length;
     } else if (_arrayName == ArrayNames.Array2) {
       return Array2.length;
     } else if (_arrayName == ArrayNames.Array3) {
       return Array3.length;
     } else if (_arrayName == ArrayNames.Array4) {
       return Array4.length;
     } else if (_arrayName == ArrayNames.Array5) {
       return Array5.length;
     } else if (_arrayName == ArrayNames.Array6) {
       return Array6.length;
     } else if (_arrayName == ArrayNames.Array7) {
       return Array7.length;
     } else if (_arrayName == ArrayNames.Array8) {
       return Array8.length;
     } else if (_arrayName == ArrayNames.Array9) {
       return Array9.length;
     } else if (_arrayName == ArrayNames.Array10) {
       return Array10.length;
     } else {
       revert('Array does not exist, or is not accessible');
     }
   }
}
