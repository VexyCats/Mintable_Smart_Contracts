pragma solidity ^0.4.23;


import "./ERC721Old.sol";
import "./ERC721BasicToken.sol";


/**
 * @title Full ERC721 Token
 * This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Token is ERC721Old, ERC721BasicToken {
    
    //modifier for onlyOwner
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
  // Token name
  string internal name_;
    
  // Token symbol
  string internal symbol_;
  
  //set by the creator 
  uint256 public totalSupply;
  //metaData struct that can be set by the owner. 
  //This is where the data is stored for each non-fungiible token
  //This data is decided by the owner and changes for each one 
  
  struct metaData {
     string data;
     string data1;
     string data2;
     uint256 number;
  }
  // Mapping from TokenID that stores data to said token. 
  
  //owner
  address public owner;
  mapping (uint256 => metaData) public tokenIDtometaData;
  // Mapping from owner to list of owned token IDs
  mapping(address => uint256[]) internal ownedTokens;

  // Mapping from token ID to index of the owner tokens list
  mapping(uint256 => uint256) internal ownedTokensIndex;

  // Array with all token ids, used for enumeration
  uint256[] internal allTokens;

  // Mapping from token id to position in the allTokens array
  mapping(uint256 => uint256) internal allTokensIndex;

  // Optional mapping for token URIs
  mapping(uint256 => string) internal tokenURIs;

  /**
   * @dev Constructor function
   */
  constructor(string _name, 
  string _symbol, 
  string _url, 
  string _input1, 
  string _input2, 
  string _input3, 
  uint256 _int,
  address _creator
  ) 
  public {
    name_ = _name;
    symbol_ = _symbol;
    owner = _creator;
    totalSupply = 1;
    uint _tokenId = 1;
    _mint(_creator, _tokenId, _url,  _input1, _input2,  _input3, _int);
  }

  /**
   * @dev Gets the token name
   * @return string representing the token name
   */
  function name() public view returns (string) {
    return name_;
  }

  /**
   * @dev Gets the token symbol
   * @return string representing the token symbol
   */
  function symbol() public view returns (string) {
    return symbol_;
  }

  /**
   * @dev Returns an URI for a given token ID
   * @dev Throws if the token ID does not exist. May return an empty string.
   * @param _tokenId uint256 ID of the token to query
   */
  function tokenURI(uint256 _tokenId) public view returns (string) {
    require(exists(_tokenId));
    return tokenURIs[_tokenId];
  }

  /**
   * @dev Gets the token ID at a given index of the tokens list of the requested owner
   * @param _owner address owning the tokens list to be accessed
   * @param _index uint256 representing the index to be accessed of the requested tokens list
   * @return uint256 token ID at the given index of the tokens list owned by the requested address
   */
  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  )
    public
    view
    returns (uint256)
  {
    require(_index < balanceOf(_owner));
    return ownedTokens[_owner][_index];
  }
  
  
  /**
   * @dev returns the metaData associated  with the tokenID passed in
   * @param _tokenId address owning the tokens list to be accessed
   * 
   * @return string, string, string, uint256 token ID at the given index of the tokens list owned by the requested address
   */
  function fetchData(uint256 _tokenId) 
  public 
  view 
  returns (string, string, string, uint256){
    require(exists(_tokenId));
    
    return (tokenIDtometaData[_tokenId].data, tokenIDtometaData[_tokenId].data1, tokenIDtometaData[_tokenId].data2, tokenIDtometaData[_tokenId].number);
  }


  /**
   * @dev Gets the total amount of tokens made so far by the contract
   * @return uint256 representing the total amount of tokens
   */
  function totalMade() public view returns (uint256) {
    return allTokens.length;
  }
  /**
   * @dev Gets the total amount of tokens stored by the contract
   * @return uint256 representing the total amount of tokens
   */
  function totalSupply() public view returns (uint256) {
    return totalSupply;
  }

  /**
   * @dev Gets the token ID at a given index of all the tokens in this contract
   * @dev Reverts if the index is greater or equal to the total number of tokens
   * @param _index uint256 representing the index to be accessed of the tokens list
   * @return uint256 token ID at the given index of the tokens list
   */
  function tokenByIndex(uint256 _index) public view returns (uint256) {
    require(_index < totalMade());
    return allTokens[_index];
  }

  /**
   * @dev Internal function to set the token URI for a given token
   * @dev Reverts if the token ID does not exist
   * @param _tokenId uint256 ID of the token to set its URI
   * @param _uri string URI to assign
   */
  function _setTokenURI(uint256 _tokenId, string _uri) internal {
    require(exists(_tokenId));
    tokenURIs[_tokenId] = _uri;
  }

  /**
   * @dev Internal function to add a token ID to the list of a given address
   * @param _to address representing the new owner of the given token ID
   * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
   */
  function addTokenTo(address _to, uint256 _tokenId) internal {
    super.addTokenTo(_to, _tokenId);
    uint256 length = ownedTokens[_to].length;
    ownedTokens[_to].push(_tokenId);
    ownedTokensIndex[_tokenId] = length;
  }

  /**
   * @dev Internal function to remove a token ID from the list of a given address
   * @param _from address representing the previous owner of the given token ID
   * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
   */
  function removeTokenFrom(address _from, uint256 _tokenId) internal {
    super.removeTokenFrom(_from, _tokenId);

    uint256 tokenIndex = ownedTokensIndex[_tokenId];
    uint256 lastTokenIndex = ownedTokens[_from].length.sub(1);
    uint256 lastToken = ownedTokens[_from][lastTokenIndex];

    ownedTokens[_from][tokenIndex] = lastToken;
    ownedTokens[_from][lastTokenIndex] = 0;
    // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
    // be zero. Then we can make sure that we will remove _tokenId from the ownedTokens list since we are first swapping
    // the lastToken to the first position, and then dropping the element placed in the last position of the list

    ownedTokens[_from].length--;
    ownedTokensIndex[_tokenId] = 0;
    ownedTokensIndex[lastToken] = tokenIndex;
  }
  /**
   * @dev public function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _totalSupply new Amount to be set 
   * 
   */
  function setTotalSupply(uint256 _totalSupply) public onlyOwner returns (uint256 _newSupply){
   require(msg.sender == owner);
   totalSupply = _totalSupply;
   return totalSupply;
  
  }
  /**
   * @dev public function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function mint(address _to, uint256 _tokenId, string _url, string _input1, string _input2, string _input3, uint256 _int) public onlyOwner {
  
   _mint(_to, _tokenId, _url,  _input1, _input2,  _input3, _int);
  }
  /**
   * @dev Internal function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function _mint(address _to, uint256 _tokenId, string _url, string _input1, string _input2, string _input3, uint256 _int) internal {
    require(allTokens.length < totalSupply);
    super._mint(_to, _tokenId);

    allTokensIndex[_tokenId] = allTokens.length;
    allTokens.push(_tokenId);
     _setTokenURI(_tokenId, _url);
    tokenIDtometaData[_tokenId].data = _input1;
    tokenIDtometaData[_tokenId].data1 = _input2;
    tokenIDtometaData[_tokenId].data2 = _input3;
    tokenIDtometaData[_tokenId].number = _int;
    
  }

  /**
   * @dev Internal function to burn a specific token
   * @dev Reverts if the token does not exist
   * @param _owner owner of the token to burn
   * @param _tokenId uint256 ID of the token being burned by the msg.sender
   */
  function _burn(address _owner, uint256 _tokenId) internal {
    super._burn(_owner, _tokenId);

    // Clear metadata (if any)
    if (bytes(tokenURIs[_tokenId]).length != 0) {
      delete tokenURIs[_tokenId];
    }

    // Reorg all tokens array
    uint256 tokenIndex = allTokensIndex[_tokenId];
    uint256 lastTokenIndex = allTokens.length.sub(1);
    uint256 lastToken = allTokens[lastTokenIndex];

    allTokens[tokenIndex] = lastToken;
    allTokens[lastTokenIndex] = 0;

    allTokens.length--;
    allTokensIndex[_tokenId] = 0;
    allTokensIndex[lastToken] = tokenIndex;
  }

}

