import React, { Component } from 'react'

// backend
import abi from './compiled/abi.json'
import getTime from './utils/getTime'
import getWeb3 from './utils/getWeb3'
import getIPFS from './utils/getIPFS'
import { contractAddress } from './utils/getAddress'

// frontend
import './App.css'
import {
  Header,
  MainPage,
  LeftPanel,
  SectionButton,
  RightPanel,
  Content,
  RoomScreen,
  MessageContainer,
  Message,
  Menu,
  MessageHeader,
  MessageContent,
  ChatBox,
  PrivateChatsScreen,
  HistoryScreen,
  SettingsScreen,
  InvitationScreen,
  Console
} from './Elements'

class App extends Component {
  render() {
    // current implementation of the frontend
    return (
      <div className="App">
        <Header />
        <MainPage />
      </div>
    )
  }
}

let ipfs

class Backend extends Component {
  // global vars for the current session state
  state = {
    web3GetError: false,
    ipfsGetError: false,
    web3InvalidNetwork: false,
    ipfsIsOnline: false,
    metamaskOnline: false,
    accounts: [],
    claimableTokens: 0,
    selectedAccountIndex: 0,
    balance: 0,
    blocksTilClaim: 0,
    messageHistory: [],
    tokensPerMessage: 0,
    DailyTokensNo: 0,
    latestBlockNo: 0
  }

  // Connection handler for web3
  componentDidMount = async () => {
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      console.log("using address", contractAddress)
      const contract = new web3.eth.Contract(abi, contractAddress)
      contract.setProvider(web3.currentProvider)
      const networkType = await web3.eth.net.getNetworkType()
      const web3InvalidNetwork = networkType !== 'rinkeby'
      this.setState({ web3, accounts, contract, web3InvalidNetwork }, this.syncData)
      this.interval = setInterval(() => this.syncData(), 100)
      if (accounts[this.state.selectedAccountIndex]) {
        this.setState({ metamaskOnline: true })
      }
    } catch (error) {
      alert('Failed to initialize connection, check console for specifics')
      this.setState({ web3GetError: true })
      console.log(error)
    }

    try {
      ipfs = await getIPFS()
      //Buffer = ipfs.types.Buffer

      ipfs.on('ready', async () => {
        this.setState({ ipfsIsOnline: true })
        console.log("IPFS initalized")
      })

      ipfs.once('start', async () => {
        const version = await ipfs.version()
        const info = await ipfs.id()
        const ipfsHash = info.id
        console.log("IPFS version", version.version, "started\nat:", ipfsHash)
        // in case you're getting websock 502, its a known issue: https://github.com/ipfs/js-ipfs/issues/941
      })

    } catch (error) {
      alert('Failed to initalize IPFS, check console for specifics')
      this.setState({ ipfsGetError: true })
      console.log(error)
    }
  }

  // exit
  componentWillUnmount = () => {
    clearInterval(this.interval)
    ipfs.stop()
  }

  async refreshPeerList() {
    var peersAsHtml
    try {
      const peers = await ipfs.swarm.peers()
      peersAsHtml = peers.reverse()
        .map((peer) => {
          if (peer.addr) {
            const addr = peer.addr.toString()
            if (addr.indexOf('ipfs') >= 0) {
              return addr
            }
            return addr + peer.peer.id.toB58String()
          }
          return null
        })
        .map((addr) => {
          return `<li>${addr}</li>`
        }).join('')
    } catch (err) {
      console.log(err)
    }
    return peersAsHtml
  }

  readHash = async () => {
    const { contract } = this.state
    var latestMessage = await contract.methods.getMessage().call()
    //console.log('attempting to read file at: ', latestMessage)
    try {
      const hashBuffer = await ipfs.files.cat(latestMessage)
      //console.log('read file contents:\n', hashBuffer.toString())
      var hashContents = hashBuffer.toString()

      this.setState({ hashContents })
    } catch (err) {
      this.setState({ hashContents: '' })
    }
  }

  // get info from deployed dapp and sync with session state
  syncData = async () => {
    const { web3, accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    const balance = await contract.methods
      .balanceOf(from).call()
    const messageHistory = await contract.methods
      .getMessageHistory(from).call()
    const blocksTilClaim = await contract.methods
      .getBlocksTillClaimable(from).call()
    const claimableTokens = await contract.methods
      .getClaimableTokens(from).call()
    const blocksPerClaim = await contract.methods
      .getBlocksPerClaim().call()
    const tokensPerMessage = await contract.methods
      .getTokensPerMessage().call()
    const dailyTokensNo = await contract.methods
      .getDailyTokensNo().call()
    const latestBlockNo = await web3.eth.getBlockNumber()

    const ipfsInfo = await ipfs.id()
    var ipfsHash
    if (ipfsInfo) {
      ipfsHash = ipfsInfo.id
    }
    const ipfsAddr = ipfsInfo.addresses
    var ipfsPeers = { __html: '' }
    if (this.state.ipfsIsOnline) {
      ipfsPeers = { __html: await this.refreshPeerList() }
    }

    const contractIPFSHash = await contract.methods.getHash().call()

    var latestMessage = await this.readHash()
    if (!latestMessage) {
      latestMessage = ''
    }
    //console.log(latestMessage)

    this.setState({
      ipfsHash,
      contractIPFSHash,
      ipfsAddr,
      ipfsPeers,
      balance,
      messageHistory,
      blocksTilClaim,
      claimableTokens,
      blocksPerClaim,
      tokensPerMessage,
      dailyTokensNo,
      latestBlockNo,
      latestMessage
    })
  }

  // TODO determine gas cost
  // get tokens to use to send messages
  claimMessageTokens = () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    contract.methods.claim().send({ gas: '2352262', from })
      .then((x) => { this.syncData() })
  }

  // send message
  sendMessage = async () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]
    const to = this.addressInput.value
    var message = `${getTime()}|${this.messageInput.value}\n`
    console.log(this.state.hashContents)
    if (this.state.hashContents) {
      message = `${message}${this.state.hashContents}`
    }
    console.log('attempting to send from:', from, '\nto', to, '\nmessage:', message)
    try {
      if (this.state.ipfsHash) {
        const filesAdded = await ipfs.files.add({
          path: 'testipfs',
          content: Buffer.from(message)
        })
        console.log('added file:', filesAdded[0].path, filesAdded[0].hash)
        await contract.methods.sendMessage(filesAdded[0].hash).send({ gas: '2352262', from })
        console.log('sent hash');
      }
      this.syncData()
      this.addressInput.value = ''
      this.messageInput.value = ''
    } catch (err) {
      alert('transaction rejected, console for details')
      console.log(err)
    }
  }

  render() {
    const {
      web3GetError,
      ipfsGetError,
      ipfsIsOnline,
      metamaskOnline,
      ipfsHash,
      contractIPFSHash,
      ipfsAddr,
      ipfsPeers,
      web3InvalidNetwork,
      claimableTokens,
      latestBlockNo,
      tokensPerMessage,
      dailyTokensNo,
      blocksPerClaim,
      balance,
      messageHistory,
      blocksTilClaim,
      latestMessage,
      hashContents,
      accounts,
      selectedAccountIndex
    } = this.state
    const address = accounts[selectedAccountIndex]

    if (accounts.length <= 0 && !web3GetError && !web3InvalidNetwork && !ipfsGetError && !ipfsHash && !ipfsIsOnline) {
      console.log('loading components')
      return (
        <p>loading components</p>
      )
    }

    if (!metamaskOnline) {
      console.log('unable to load metamask account, make sure you are logged in')
      return (
        <p>unable to load metamask account, make sure you are logged in</p>
      )
    }

    if (web3GetError) {
      console.log('unable to load web3, make sure metamask is installed')
      return (
        <p>unable to load web3, make sure metamask is installed</p>
      )
    }

    if (ipfsGetError) {
      console.log('unable to load ipfs, i dont know how to fix this yet')
      return (
        <p>unable to load ipfs, i dont know how to fix this yet</p>
      )
    }

    if (web3InvalidNetwork) {
      console.log('please change to the rinkeby network and refresh')
      return (
        <p>please change to the rinkeby network and refresh</p>
      )
    }
    
    // backend stuff not yet implemented
    return (
      <div class="Backend">
        <header className="Backend-header">
          <h1>eth/ipfs example</h1>
        </header>
        <p>account address: {address}</p>
        <p>contract ipfs hash: {contractIPFSHash}</p>
        <p>local ipfs hash: {ipfsHash}</p>
        <p>ipfs swarm address: {ipfsAddr}</p>
        <p>claimableTokens: {claimableTokens}</p>
        <p>latestBlockNo: {latestBlockNo}</p>
        <p>tokensPerMessage: {tokensPerMessage}</p>
        <p>dailyTokensNo: {dailyTokensNo}</p>
        <p>blocksPerClaim: {blocksPerClaim}</p>
        <p>balance: {balance}</p>
        <p>messageHistory: {messageHistory[messageHistory.length - 1]}</p>
        <p>blocksTilClaim: {blocksTilClaim}</p>
        <p>latestMessage: {latestMessage}</p>
        <button onClick={this.readHash}>Read from Hash</button>
        <p>Contents from Hash: {hashContents}</p>
        <button onClick={this.claimMessageTokens}>Claim Tokens</button>
        <br /><br />
        <p>address: </p>
        <input latype="text" ref={(input) => this.addressInput = input} />
        <br /><br />
        <p>message: </p>
        <input type="text" ref={(input) => this.messageInput = input} />
        <button onClick={this.sendMessage}>Send</button>

        <p>ipfs peerlist: </p>
        <ul dangerouslySetInnerHTML={ipfsPeers}></ul>
      </div>
    )
  }
}

export default App
