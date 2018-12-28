pragma solidity ^0.4.24;

interface IMintableStorage {
    //public array of all tokens made by this contract
    function tokensArray (uint256 id) external view returns (address);
    //tracking total contracts created
    function totalGenerated () external view returns (uint256);
    //takes an address and returns an array of the token IDs in which they own
    function ownedTokens (address id) external view returns (uint256[]);
    //Mapping to hold the contracts allowed to update state on the storage contract
    function approvedStorageUsers (address id) external view returns (bool);
    //checks and stores VIP users, that have donated
    function VIPsupporters (address id) external view returns (bool);
    //Current cost to Mint
    function MintFee () external view returns (uint256);
    //Cost for Exchange
    function ExchangeFee () external view returns (uint256);
    //Minimum doantion to receive gift from Donation contract
    function MinimumGiftDonation () external view returns (uint256);
    //Extra storage arrays
    function Array1 (uint256 id) external view returns (bytes32[]);
    function Array2 (uint256 id) external view returns (bytes32[]);
    function Array3 (uint256 id) external view returns (bytes32[]);
    function Array4 (uint256 id) external view returns (bytes32[]);
    function Array5 (uint256 id) external view returns (bytes32[]);
    function Array6 (uint256 id) external view returns (bytes32[]);
    function Array7 (uint256 id) external view returns (bytes32[]);

    // event ItemStored(address indexed _sender, bytes32 indexed _data);
    function totalSupply() external returns (uint256);


    function addTokensArray(address _newAddress) external
    returns (bool);

    function setApprovedContract(address _newContract, bool _approval) external
    returns (bool);

    function addVIP(address _supporter) external
    returns (bool);

    function setMintFee(uint256 _fee) external
    returns (bool);

    function setExchangeFee(uint256 _fee) external
    returns (bool);

    function addToArray (uint256 _arrayName, bytes32 _content) external
    returns (bool);

    function totalUserTokens(address _user) external view
    returns (uint256 _totalTokens);

    function getUserTokens(address _user) external view
    returns (uint256[]);

    function fetchArrayLength (uint256 _arrayName) external view
    returns (uint256 _length);

    function fetchInternalArrayItem (uint256 _arrayName, uint256 _index) external view
    returns (bytes32);

    function fetchInternalArray (uint256 _arrayName) external view
    returns (bytes32[]);

    function setMinimumGiftDonation(uint256 _fee) external
    returns (bool);

    function transferOwnership(address _newOwner) external
    returns (bool);
}
