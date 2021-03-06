pragma solidity ^0.4.21;

//import zeppelin standard for erc721
import "./ERC721Full.sol";
import "./ERC721FullMintable.sol";
import "./IMintableStorage.sol";




/**
 * @title Full ERC721 Token Generator
 * This smart contract allows you to create an ERC721 of your own, very easily!
 * How it works
 * - Call function createERC721 and pass in the metadata for your token
 * - It can take multiple params
 * - You can then call the public viewYourTokens with your address to see the ID's of your new ERC721s.
 * - Then you can call viewAddressArray with your token ID to see the address of your new token.
 *
 *
 *
 *
 *
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
/// @title Desing by contract (Hoare logic)
/// @author Melonport AG <team@melonport.com>
/// @notice Gives deriving contracts design by contract modifiers


contract ERC721Generator{

   /**
   * @dev Checks for a pre-condition
   * @param condition bool the condition you want to be tested
   */
   // PRE, POST CONDITIONS
   modifier pre_cond(bool condition) {
        require(condition);
        _;
    }
   /**
   * @dev Checks for a post-condition
   * @param condition bool the condition you want to be tested
   */
    modifier post_cond(bool condition) {
        _;
        assert(condition);
    }


    using SafeMath for uint256;
string public version = "Mintable v0.1";
    bool public isOnline;
    address public owner;
    IMintableStorage public Storage;

    //event
    event erc721Created(address indexed _sender, address indexed _newContract);

     /**
   * @dev sets owner, sets isOnline to true
   *  //make sure to set up the storage contract and add this after deployment to approved storage users
   */
    constructor(address _storage) public{
        isOnline = true;
        owner = msg.sender;
        Storage = IMintableStorage(_storage);
    }

    function mintFee() public view returns(uint256) {
        return Storage.MintFee();
    }

    /**
   * @dev internal, checks for ownership
   * @return bool if msg.sender is owner
   */
    function isOwner() internal view returns (bool) {
        return msg.sender == owner;
    }

    function hasFee() public view returns (bool) {
        return msg.value >= mintFee();
    }

    /**
   * @dev Gets the total amount of tokens stored by the contract
   * @return uint256 representing the total amount of tokens
   */
    function viewTotal() public view returns(uint256 _totalGenerated){
        return Storage.totalGenerated();
    }


    /**
   * @dev Gets the total amount of tokens owned by the sender
   * @return uint[] with the id of each token owned
   */
    function viewYourTokens() public view  returns (uint256[] _yourTokens){
      return Storage.getUserTokens(msg.sender);
    }

    /**
   * @dev Gets the address of the contract, takes a token ID
   * @return address of the contract for the token
   */
    function viewAddressArray(uint _id) view public returns (address _yourToken){
        return Storage.tokensArray(_id);
    }

      /**
   * @dev changes ownership, must be current owner
   * @param ofNewOwner address, the new owners address
   */
    function changeOwner(address ofNewOwner) public pre_cond(isOwner()) {
        owner = ofNewOwner;
    }

    /**
   *
   * @dev creates a new erc721 contracts
   * @param _name name of contract
   * @param _symbol symbol for contract
   *
   * @return address of the newly created contract
   */
    function createERC721(string _name, string _symbol, string _url)
    public  pre_cond(isOnline)
    payable
    returns(address _newContract)
    {
        if(Storage.VIPsupporters(msg.sender) != true){
            require(hasFee());
        }
        ERC721Full erc721 = new ERC721Full(_name, _symbol, _url, msg.sender);

        Storage.addTokensArray(address(erc721));
        erc721.addMinter(msg.sender);

        emit erc721Created(msg.sender, erc721);
        return erc721;

    }

     /**
   *
   * @dev creates a new erc721 contracts
   * @param _name name of contract
   * @param _symbol symbol for contract
   *
   * @return address of the newly created contract
   */
    function createERC721Metadata(string _name, string _symbol, string _url, string _input1, string _input2, string _input3)
    public  pre_cond(isOnline)
    payable
    returns(address _newContract)
    {
        ERC721FullMintable erc721 = new ERC721FullMintable(_name, _symbol, _url, _input1, _input2, _input3, msg.sender);

        Storage.addTokensArray(erc721);
        erc721.addMinter(msg.sender);

        emit erc721Created(msg.sender, erc721);
        return erc721;

    }

        /**
   * @dev Sets the storage contract for sotring data
   * @return  bool true or false
   */
    function setStorageContract(address _addr) public  returns (bool){
        require(isOwner());
        Storage = IMintableStorage(_addr);
        return true;
    }

     /**
   * @dev Sets the isOnline state variable, only owner
   * @return state of isOnline
   */
     function toggleOnlineStatus() public pre_cond(isOwner())  returns (bool status){
         isOnline = !isOnline;
         return isOnline;
    }
    /**
   * @dev fallback revert
   *
   */
   function()
   payable
      public
    {
       revert();
   }
   /**
   * @dev Kill, only owner. Destroys the smart contract
   *
   */
  function kill()
    public
  {
       require(isOwner());
       selfdestruct(msg.sender);
  }

  function withdrawal() pre_cond(isOwner())
    public
  returns (bool){
    require(address(this).balance > 0, 'No balance');

    msg.sender.transfer(address(this).balance);
    return true;
  }


}
