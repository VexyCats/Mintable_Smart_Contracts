import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Footer from "./Components/footer";
import Create from "./Components/create/index.js";
import Sidebar from "./Components/sidebar";
import ERC721Generator from "./build/contracts/ERC721Generator.json";
import ERC721Token from "./build/contracts/ERC721Full.json";
import getWeb3 from "./utils/getWeb3.js";
import getRecentlyMade from "./utils/getRecentlyMade.js";
import Manage from "./Components/manage";
import Browse from "./Components/browse";
import getEthPrice from "./utils/fetchETHprice.js";
import sendDonate from "./utils/donateETH.js";
import ReactGA from "react-ga";
import Home from "./Components/home";
import DonationContract from "./build/contracts/MintableDonation.json";
import ERC721Mintable from "./build/contracts/ERC721FullMintable.json";
import FetchERC721 from "./utils/fetchERC721.js";
import Submit721 from "./utils/submit721.js";
import ErrorBoundary from "./Components/manage/ErrorBoundary.js";
import setListeners from "./utils/setListeners.js";
import Profile from "./Components/profile";
import Exchange from "./Components/exchange";
import Help from "./Components/help";
import ComingSoon from "./Components/ComingSoon";
//import Auction from "./Components/auction";
import FetchTotal from "./utils/fetchTotalonDB.js";
import "./App.css";

const API_KEY = `${process.env.REACT_APP_DEV_API_URL}`;
const MINT_LOG_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const contract = require("truffle-contract");
class App extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0);
    this.state = {
      recentlyMade: [],
      cardInfo: [],
      runningFetchFlag: false,
      screenWidth: null,
      network: null,
      tokenGen: null,
      alphaNotDone: false
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.getNetworkCall = this.getNetworkCall.bind(this);
    this.fetchTotalRecentlyMade = this.fetchTotalRecentlyMade.bind(this);
    this.ethereumReady = this.ethereumReady.bind(this);
    this.fetchWeb3 = this.fetchWeb3.bind(this);
    this.resetDonate = this.resetDonate.bind(this);
  }

  async fetchTotalRecentlyMade() {
    //fetches total number of cards from DB
    //console.log("fetching cards on backend for browse");
    try {
      let res = await FetchTotal();
      this.setState({
        totalonDB: res.body.Items
      });
      //console.log(this.state.totalonDB);
    } catch (err) {
      //console.log("DB call error: " + err);
    }
  }
  getNetworkCall() {
    return (
      (this.state.web3.version && this.state.web3.version.getNetwork) ||
      (this.state.web3.eth.net && this.state.web3.eth.net.getId)
    );
  }
  error() {
    if (this.state.hasError) {
      return false;
    }
    console.log("calling error function in appp.js");
    this.setState({
      hasError: true
    });
    return <ErrorBoundary />;
  }
  clearError() {
    if (!this.state.hasError) {
      return false;
    }
    //console.log("clearing error function in appp.js");
    this.setState({
      hasError: false
    });
  }
  initializeReactGA() {
    ReactGA.initialize("UA-130122103-1");
    ReactGA.pageview("/home");
  }
  async checkNetwork() {
    if (this.state.web3 && this.state.network !== null) {
      console.log("Exitting checkNetwork");
      return;
    }
    await this.getNetworkCall()((err, netId) => {
      console.log(netId);
      switch (String(netId)) {
        case "1":
          this.setState({
            network: netId,
            timer: setInterval(() => this.timer(), 800)
          });
          //console.log("This is the mainnet  network.");
          this.setState({
            flag: true
          });
          break;
        case "2":
          this.setState({
            network: netId
          });
          //console.log("This is the deprecated Morden test network.");
          break;
        case "3":
          this.setState({
            network: netId
          });
          //console.log("This is the ropsten test network.");
          break;
        case "5777":
          this.setState({
            network: netId,
            timer: setInterval(() => this.timer(), 800)
          });

          break;
        case "4":
          this.setState({
            network: netId,
            timer: setInterval(() => this.timer(), 800)
          });
          //console.log("This is the rinkeby test network.");
          this.setState({
            flag: true
          });
          break;
        default:
          this.setState({
            network: "unknown"
          });
        //console.log("This is an unknown network.");
      }

      this.startApp();
    });
    await this.state.web3.eth.getAccounts((error, accounts) => {
      console.log("Running check accounts in checkNetwork");
      if (typeof accounts === "object" && accounts.length > 0) {
        this.state.web3.eth.defaultAccount = accounts[0];
        this.setState({
          account: accounts[0],
          locked: false,
          web3Flag: false
        });

        //console.log(accounts[0]);
      }
    });
    //console.log("checkNetwork");
    //var web3 = window.web3

    return;
  }
  ethereumReady() {
    return this.state.web3 && this.state.tokenGen && this.state.token721;
  }
  async loadGenContracts() {
    if (!this.state.web3) {
      throw new Error("Web3 should be loaded to load contracts");
    }
    if (this.ethereumReady()) {
      return;
    }
    //console.log("loadGenCont");
    try {
      if (!this.state.token721) {
        const token721 = contract(ERC721Mintable);
        token721.setProvider(this.state.web3.currentProvider);
        this.setState(
          {
            token721: token721
          },
          () => true
        );
      }

      if (!this.state.tokenGen) {
        const TokenGen = contract(ERC721Generator);
        TokenGen.setProvider(this.state.web3.currentProvider);

        /* 
          11/29/2018 - First real deploy --- REAL MAINNET VERSION 
          mainnet storage = 0xfe9fdb141bfb07d1aad119ab4cd3a79d3c7c5c80
          mainnet generator = 0x415318ff3843fb0e1a5167781fadcfdb006f219e
          mainnet donation721 token = 0x14b76477739b4eeeab7af197f638d882373b8329
          mainnet donation contract = 0xc041154d39f54fdeb90ac5d64b2414c5024080aa
          -Zach
        */

        // mainnet tokenGen without storageawait TokenGen.at("0xd589d6e8dec628175c582ef09329ee1e14cedb89").then(
        // mainnet tokenGen without storage  res => {
        // mainnet tokenGen without storage    tokeGen = res;
        // mainnet tokenGen without storage  }
        // mainnet tokenGen without storage);

        //Rinkeby tokenGen with Mintable storage - OLD
        // Storage: 0x5fd5e2b6737308ca33c706836b9c5e7655371449
        // Token Gen: 0x4ae63c4aec4509e9be38b3f80979213e569fc337

        //Rinkeby tokenGen with Mintable storage - NEW 12/5/2018
        // Storage: 0x37d3c531d76958579e044d2052a5929ed206c85f
        // Token Gen: 0x130c1ebb21075dadfbb3baf9f6d48055ed0cb5d7
        // donation721: 0x0c44b42dcce3d2895ca11ce2e4a7fb4aa8888cf8
        // donation: 0xbe2492b816c980479b150b02c6e7bb824a2e68c5

        let tokeGen;
        await TokenGen.at("0x415318ff3843fb0e1a5167781fadcfdb006f219e").then(
          res => {
            tokeGen = res;
          }
        );
        if (tokeGen) {
          this.setState(
            {
              tokenGen: tokeGen
            },
            () => true
          );
        }
      }

      // Require the package that was previosly saved by truffle-artifactor

      if (this.ethereumReady()) {
        return true;
      } else {
        throw new Error("Unable to load contracts successfully");
      }
    } catch (e) {
      console.error(e);
      throw new Error(e.message || e);
    }
  }
  async resolveWeb3() {
    if (this.state.web3Flag) {
      console.log("web3flag in state is on, exitting resolveWeb3");
      return false;
    }
    if (this.state.web3 === undefined || !this.state.web3Flag) {
      this.setState({
        web3Flag: true
      });
      console.log(
        "Running web3 which should only run once...web3 is: " + this.state.web3
      );
      let price = await getEthPrice();
      this.setState({
        ethPrice: price
      });
    }
    return new Promise(async (resolve, reject) => {
      try {
        let results = await getWeb3;
        if (results.web3) {
          this.setState({
            web3: results.web3,
            web3Flag: false
          });
          resolve(true);
        } else {
          throw "Web3 not loaded";
        }
      } catch (e) {
        this.setState({
          web3Flag: false
        });
        console.error(e.message || e);
        reject(new Error(e.message || e));
      }
    });
  }
  async startApp() {
    try {
      if (this.state.web3 !== undefined) {
        await this.checkNetwork();
      }
      await this.loadGenContracts();
      await this.fetchAddressFromSmartContract();
    } catch (err) {
      console.error(err);
    }
  }
  async componentWillMount() {
    this.initializeReactGA();

    try {
      await this.resolveWeb3();
      this.fetchTotalRecentlyMade();
      this.startApp();
      this.fetchAddressFromSmartContract();
      // Instantiate contract once web3 provided.
    } catch (e) {
      throw new Error(e.message || e);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
    clearTimeout(this.state.errTimer);
    window.removeEventListener("resize", this.updateWindowDimensions);
  }
  async componentDidMount() {
    window.addEventListener("resize", this.updateWindowDimensions());
  }
  defaultSrc() {
    return this.state.defaultSrc;
  }
  async fetchWeb3() {
    //gets called from WEB3HOC.js if there is no web3
    //point of this is to restore web3 when they are disconnected

    //main issue - refresh the app, then go to another tab until it loads
    // when you come back, web3hoc will be open and it will never set web3
    // //console.log(this.state.web3);
    // if (typeof this.state.web3 === "undefined") {
    //   //console.log("checking web3");
    //   let i = 0;
    //   if (i == 0) {
    //     i = i + 1;
    //     await getWeb3.then(results => {
    //       this.setState({
    //         web3: results.web3
    //       });
    //     });
    //   } else {
    //     return false;
    //   }
    // }
    await this.resolveWeb3();
  }
  updateWindowDimensions() {
    this.setState({ screenWidth: window.innerWidth });
  }
  errTimer(err) {
    //this is started when the manager starts looking updata, if the time to pull data is too long, it will kill it.
    alert(err);
    return this.props.history.push(`/Manager`);
  }
  timer() {
    ////console.log("Checking for web3 accounts");
    //timer to pull the activate account address and update it when switches
    this.state.web3.eth.getAccounts((err, accounts) => {
      if (!err) this.state.web3.eth.defaultAccount = accounts[0];
      //console.log(err);
      else if (this.state.web3.eth.defaultAccount !== this.state.account)
        this.setState({
          account: this.state.web3.eth.defaultAccount
        });
    });
  }
  async fetchAddressFromSmartContract() {
    //console.log("Running fetch address in app.js");
    //console.log(this.state);
    if (!this.state.web3Flag && this.ethereumReady()) {
      const { tokenGen } = this.state;
      let totalTokens = 0;
      let results = await tokenGen.viewTotal.call();
      totalTokens = results.toNumber();
      this.setState({
        totalMadeSC: totalTokens
      });
      this.loadRecentlyMadeForCreatePage();
      //console.log("total Tokens made: " + this.state.totalMadeSC);

      if (this.state.totalMadeSC === 0) {
        this.reload();
        return false;
      }
    }
    //console.log(this.state.tokenGen);
  }
  reload() {
    this.state.cardInfo = [];
    this.state.runningFetchFlag = false;
    this.fetchAddressFromSmartContract();
  }
  async loadRecentlyMadeForCreatePage() {
    // fetch card data from contract
    // pull x amount of cards
    // push to server?
    try {
      if (!this.state.runningFetchFlag) {
        let { token721, tokenGen } = this.state;

        this.setState({
          runningFetchFlag: true
        });
        if (tokenGen) {
          for (let i = 15; i <= this.state.totalMadeSC - 1; i++) {
            if (i <= 0) {
              //console.log("Error, fetching token id : " + i);
              //console.log("checking address = " + i);
              let tokenAddress = await getRecentlyMade(i, tokenGen);
              //console.log(tokenAddress);
              if (tokenAddress == "0x") {
                return false;
              }
              let instance;
              await token721.at(tokenAddress).then(res => {
                instance = res;
              });
              let res = await FetchERC721(instance);
              let cardinfo = {};
              //console.log(res);
              if (res !== false) {
                cardinfo = {
                  address: tokenAddress,
                  instance: instance,
                  id: 0,
                  isMintableAddress: true,

                  ...res
                };
              }

              this.setState({
                cardInfo: [...this.state.cardInfo, cardinfo],
                runningFetchFlag: false
              });
            } else if (i >= 1) {
              //console.log("checking address = " + i);
              if (i >= this.state.totalMadeSC) return false;
              let tokenAddress = await getRecentlyMade(i, tokenGen);
              //console.log(tokenAddress);
              if (tokenAddress == "0x") {
                return false;
              }
              let instance;
              await token721.at(tokenAddress).then(res => {
                instance = res;
              });
              let res = await FetchERC721(instance);

              let cardinfo = {
                address: tokenAddress,
                instance: instance,
                id: 0,
                isMintableAddress: true,
                ...res
              };

              this.setState({
                cardInfo: [...this.state.cardInfo, cardinfo],
                runningFetchFlag: false
              });
            }
          }
        }
        //console.log(this.state.cardInfo);
      }
    } catch (e) {
      //console.log(e);
    }
  }
  async submit721(userInfo) {
    let tokenGen = this.state.tokenGen;

    let tx = Submit721(userInfo, tokenGen, this.state.account);
    setListeners(tx, {
      onTransactionHash: hash =>
        console.log("TransactionHash: ", hash) ||
        this.setState({
          TxHash: hash
        }),
      onReceipt: receipt => {
        console.log(
          "Receipt ready: ",
          receipt.transactionHash,
          receipt.blockNumber
        );
      }
    });

    let result = {
      receipt: await tx
    };
    if (result) {
      return result.receipt;
    }
  }

  resetDonate() {
    this.setState({
      donateTxHash: undefined,
      donateReceipt: undefined
    });
  }

  async parseMintEvent(receipt) {
    const log =
      receipt.logs &&
      receipt.logs.find(log => log.topics && log.topics[0] === MINT_LOG_TOPIC);
    const ABI = this.state.web3.eth.abi;

    return log
      ? {
          address: log.address,
          receiver: await ABI.decodeParameter("address", log.topics[2]),
          tokenId: await ABI.decodeParameter("uint256", log.topics[3])
        }
      : log;
  }

  async submitDonation(amount, listeners) {
    if (!this.state.ethPrice) {
      let price = await getEthPrice();
      this.setState({
        ethPrice: price
      });
    }
    let price = this.state.ethPrice;
    let ethAmount = amount / price;
    console.log("User is going to donate this much: " + amount);

    if (typeof ethAmount !== "number") {
      console.log("Amount is not a valid input type!");
      return false;
    }
    const donateContract = contract(DonationContract);
    donateContract.setProvider(this.state.web3.currentProvider);
    let donate;
    await donateContract
      .at("0xc041154d39f54fdeb90ac5d64b2414c5024080aa")
      .then(res => {
        donate = res;
      });
    const donationTX = sendDonate(
      ethAmount,
      this.state.account,
      donate,
      this.state.web3
    );

    setListeners(donationTX, {
      onTransactionHash: hash =>
        console.log("TransactionHash: ", hash) ||
        this.setState({
          donateTxHash: hash
        }) ||
        (listeners.onTransactionHash && listeners.onTransactionHash(hash)),
      onReceipt: receipt => {
        console.log(
          "Receipt ready: ",
          receipt.transactionHash,
          receipt.blockNumber
        );
        this.setState({
          donateReceipt: receipt
        });
        listeners.onReceipt && listeners.onReceipt(receipt);
      }
    });

    let result = {
      receipt: await donationTX
    };

    console.log(result);
    if (result.receipt) {
      this.setState({
        usersDonation: result.receipt
      });
      console.log(result.receipt);
    }
  }
  render() {
    return (
      <Router onUpdate={() => window.scrollTo(0, 0)}>
        <Switch>
          <div className="mainGrid">
            <Sidebar />
            <Footer />
            {this.state.alphaNotDone ? (
              <ComingSoon width={this.state.screenWidth} />
            ) : (
              <div>
                <ErrorBoundary>
                  <Route
                    onUpdate={() => window.scrollTo(0, 0)}
                    exact
                    path="/"
                    render={props => (
                      <Home
                        {...props}
                        width={this.state.screenWidth}
                        network={this.state.network}
                        accounts={this.state.account}
                        resetDonate={this.resetDonate.bind(this)}
                        donateTxHash={this.state.donateTxHash}
                        donateReceipt={this.state.donateReceipt}
                        donate={this.submitDonation.bind(this)}
                        web3={this.state.web3}
                        ethPrice={this.state.ethPrice}
                        totalCards={this.state.totalonDB}
                        ethereumReady={this.ethereumReady}
                      />
                    )}
                  />
                  <ErrorBoundary>
                    <Route
                      onUpdate={() => window.scrollTo(0, 0)}
                      exact
                      path="/create"
                      render={props => (
                        <div className="extension">
                          <Create
                            {...props}
                            ethPrice={this.state.ethPrice}
                            TxHash={this.state.TxHash}
                            fetchWeb3={this.fetchWeb3}
                            network={this.state.network}
                            accounts={this.state.account}
                            web3={this.state.web3}
                            submit721={this.submit721.bind(this)}
                            recentlyMade={this.state.cardInfo}
                            readyFlag={this.state.readyFlag}
                            donate={this.submitDonation.bind(this)}
                            error={this.error.bind(this)}
                            ethereumReady={this.ethereumReady.bind(this)}
                            loadRecentlyMade={this.reload.bind(this)}
                          />
                        </div>
                      )}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <Route
                      exact
                      path="/manager"
                      render={props => (
                        <Manage
                          {...props}
                          network={this.state.network}
                          accounts={this.state.account}
                          donateTxHash={this.state.donateTxHash}
                          donateReceipt={this.state.donateReceipt}
                          web3={this.state.web3}
                          width={this.state.screenWidth}
                          resetDonate={this.resetDonate.bind(this)}
                          fetchWeb3={this.fetchWeb3}
                          ethPrice={this.state.ethPrice}
                          submit721={this.submit721.bind(this)}
                          getWeb3={this.checkNetwork}
                          account={this.state.account}
                          donate={this.submitDonation.bind(this)}
                          error={this.error.bind(this)}
                          donate={this.submitDonation.bind(this)}
                          clearError={this.clearError.bind(this)}
                          hasError={this.state.hasError}
                          ethereumReady={this.ethereumReady}
                        />
                      )}
                    />{" "}
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <Route
                      exact
                      path="/manager/:address"
                      render={props => (
                        <Manage
                          {...props}
                          network={this.state.network}
                          accounts={this.state.account}
                          donateTxHash={this.state.donateTxHash}
                          donateReceipt={this.state.donateReceipt}
                          ethPrice={this.state.ethPrice}
                          submit721={this.submit721.bind(this)}
                          getWeb3={this.checkNetwork}
                          fetchWeb3={this.fetchWeb3}
                          resetDonate={this.resetDonate.bind(this)}
                          error={this.error.bind(this)}
                          hasError={this.state.hasError}
                          width={this.state.screenWidth}
                          web3={this.state.web3}
                          ethereumReady={this.ethereumReady}
                          donate={this.submitDonation.bind(this)}
                        />
                      )}
                    />
                  </ErrorBoundary>
                  <Route
                    exact
                    path="/manager/:address/:tokenID"
                    render={props => (
                      <Manage
                        {...props}
                        web3={this.state.web3}
                        network={this.state.network}
                        ethPrice={this.state.ethPrice}
                        getWeb3={this.checkNetwork}
                        donateTxHash={this.state.donateTxHash}
                        donateReceipt={this.state.donateReceipt}
                        fetchWeb3={this.fetchWeb3}
                        width={this.state.screenWidth}
                        submit721={this.submit721.bind(this)}
                        accounts={this.state.account}
                        resetDonate={this.resetDonate.bind(this)}
                        donate={this.submitDonation.bind(this)}
                        error={this.error.bind(this)}
                        ethereumReady={this.ethereumReady}
                        hasError={this.state.hasError}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/browse"
                    render={props => (
                      <Browse
                        {...props}
                        network={this.state.network}
                        donateTxHash={this.state.donateTxHash}
                        donateReceipt={this.state.donateReceipt}
                        accounts={this.state.account}
                        ethPrice={this.state.ethPrice}
                        web3={this.state.web3}
                        ethereumReady={this.ethereumReady}
                        donate={this.submitDonation.bind(this)}
                        totalCards={this.state.totalonDB}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/profile"
                    render={props => (
                      <Profile
                        {...props}
                        network={this.state.network}
                        accounts={this.state.account}
                        ethPrice={this.state.ethPrice}
                        donateTxHash={this.state.donateTxHash}
                        donateReceipt={this.state.donateReceipt}
                        web3={this.state.web3}
                        resetDonate={this.resetDonate.bind(this)}
                        ethereumReady={this.ethereumReady}
                        donate={this.submitDonation.bind(this)}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/auction"
                    render={props => (
                      <Exchange
                        {...props}
                        network={this.state.network}
                        accounts={this.state.account}
                        ethPrice={this.state.ethPrice}
                        web3={this.state.web3}
                        donateTxHash={this.state.donateTxHash}
                        donateReceipt={this.state.donateReceipt}
                        ethereumReady={this.ethereumReady}
                        donate={this.submitDonation.bind(this)}
                        resetDonate={this.resetDonate.bind(this)}
                        parseMint={this.parseMintEvent.bind(this)}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/help"
                    render={props => <Help {...props} />}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </Switch>
      </Router>
    );
  }
}

export default App;
