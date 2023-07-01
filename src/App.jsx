import React, {useEffect, useState} from "react";
import Web3 from "web3";
import {ethers} from "ethers";
import tokenabi from './abi_token.json';
import nftabi from './abi_nft.json';

function App() {

  const [blockNumber, setBlockNumber] = useState();
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [tbalance, setTbalance] = useState();

  const web3 = new Web3("wss://goerli.infura.io/ws/v3/13bee00ed8d04b969173e4691bfe996c");
  const web3_2 = new Web3("https://goerli.infura.io/v3/13bee00ed8d04b969173e4691bfe996c");

  var token_c_address = '0x8Bc205608A8424fC9bF0975cB8518DefBa4C3766';
  var nft_c_address = '0x41B90AD08487Cb7Bcf7e60E4e1845A54b1A4b22d';

  var tokenContract = new web3_2.eth.Contract(tokenabi, token_c_address);
  var nftContract = new web3_2.eth.Contract(nftabi, nft_c_address);

  async function connect() {
    if(window.ethereum) {
      try {
        const res = await window.ethereum.request({
          method : "eth_requestAccounts",
        });
        setAccount(res[0]);

        getBalance()
        getTbalance();
      
      } catch(err) {
        console.error(err);
      }
    } else {
      console.log("Install metamask");
    }
  }

  async function getTbalance() {
    if(account) {
      try {
        var a = await tokenContract.methods.balanceOf(account).call()
        setTbalance(Number(a));
      } catch(err) {
        console.error(err);
      }
    } else {
      console.log("connect the wallet");
    }
  }

  useEffect(()=>{
    async function getBlock() {
      const blockNumber = await web3.eth.getBlockNumber();
      setBlockNumber(Number(blockNumber));
    }

    getBlock();
  })
  
  
  async function getBalance() {
    const res = await window.ethereum.request({
      method : "eth_requestAccounts",
    });

    if(account) {
      const _balance = await window.ethereum.request({
        method : "eth_getBalance",
        params : [res[0].toString(), "latest"]
      });
    
      setBalance(ethers.formatEther(_balance));
    } else {
      console.log("wallet is not connected");
    }
  }

  useEffect(()=> {

    async function subscribeBlock() {
      const subscription = await web3.eth.subscribe("newHeads");
      subscription.on("data", async(blockHead) => {
        setBlockNumber(Number(blockHead.number));
      });
    }

    subscribeBlock();

    getTbalance();
    getBalance();
  })

  async function getChainId() {
    if(window.ethereum) {
      const ID = await window.ethereum.request({
        method : "eth_chainId",
      });
      setChainId(ID);
    }
  }

  getChainId();

  async function chainChanged() {
    if(window.ethereum) {
      setAccount(null);
      setBalance(null);
      connect();
      getChainId();
    }
  }

  useEffect(()=> {
    if(window.ethereum) {
      window.ethereum.on("chainChanged", chainChanged)
    }
  })

  useEffect(()=> {
    if(window.ethereum) {
      window.ethereum.on("accountsChanged", connect)
    }
  })

  async function mintNFTwithERC20(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    
    await window.ethereum.request({
      method : "eth_sendTransaction",
      params : [{
        from : account, 
        to : nft_c_address,
        // value : ,
        data : nftContract.methods.mintNFT1(data.get("Number", "Price")).encodeABI()}]
    })
  }

  return (
    <div className="bg-pink-300 min-h-screen flex justify-center items-center">
      <div className="border-4 border-black mr-10" onClick={()=>{connect();}}>CONNECT WALLET</div>
      <ul className="flex-row">
        <li>current Block number : {blockNumber}</li>
        <li>current Address : {account}</li>
        <li>currnet balance : {balance} eth</li>
        <li>current token balance : {tbalance} </li>
        <li>current chainId : {chainId} </li>
      </ul>
      <form className="border-2" onSubmit={mintNFTwithERC20}>
        <input type="text" name="Number"></input>
        <input type="text" name="Price"></input>
        <button type="submit">MINT_ERC20</button>
      </form>
    </div>
  );
}

export default App;