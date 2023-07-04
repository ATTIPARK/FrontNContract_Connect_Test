import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import axios from "axios";
import tokenabi from "./abi_token.json";
import nftabi from "./abi_nft.json";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [token, setToken] = useState("");
  const [present, setPresent] = useState(false);
  const [currentB, setCurrentB] = useState("");
  const [finalB, setFinalB] = useState("");
  const [ratio, setRatio] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [coinPrice, setCoinPrice] = useState();

  const getCoinPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.upbit.com/v1/ticker?markets=KRW-BTC,%20KRW-ETH,%20KRW-MATIC"
      );

      // setCoinPrice([
      //   { symbol: "MATIC", price: response.data[2].trade_price }
      // ]);

      console.log(response.data[2]);
      setCoinPrice(response.data[2].trade_price);
    } catch (error) {
      console.error(error);
    }
  };

  const web3 = new Web3(window.ethereum);
  // const web3_2 = new Web3("https://goerli.infura.io/v3/13bee00ed8d04b969173e4691bfe996c");

  var token_c_address = "0xc369FA9F8392e1d633B9068C7fFd1C0b4BF752d5";
  var nft_c_address = "0xDF0CD28266e8B5CB9D028310BCA549c0a0f26f40";

  var tokenContract = new web3.eth.Contract(tokenabi, token_c_address);
  var nftContract = new web3.eth.Contract(nftabi, nft_c_address);

  const onClickAccount = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts[0]);
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickLogOut = () => {
    setAccount("");
  };

  const onClickBalance = async () => {
    const res = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    try {
      if (!account) return;

      const _balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [res[0].toString(), "latest"],
      });

      console.log(_balance);
      setBalance(ethers.formatEther(_balance));
    } catch (error) {
      console.error(error);
    }
  };

  const onClickToken = async () => {
    try {
      const _token = await tokenContract.methods.balanceOf(account).call();

      console.log(_token);
      setToken(Number(_token));
    } catch (error) {
      console.error(error);
    }
  };

  const buyToken = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    // var input = web3.utils.numberToHex(Number(data.get("amount")));

    // await window.ethereum.request({
    //   method : "eth_sendTransaction",
    //   params : [{from : account, data : nftContract.methods.buyCoin(data.get("amount")).encodeABI()}]
    // })

    // console.log(typeof Number(data.get("amount")));
    console.log((1 / coinPrice) * Number(data.get("amount")));

    var input = (1 / coinPrice) * Number(data.get("amount"));

    var _value = web3.utils.toWei("0.001", "ethers");
    console.log(_value);

    const response = await nftContract.methods
      .buyCoin(data.get("amount"))
      .send({
        from: account,
        value: web3.utils.toWei(input, "ethers"),
      });

    console.log(response);
  };

  const submitPresent = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    await nftContract.methods
      .mintNFT1(data.get("number_1"), data.get("price_1"))
      .send({
        from: account,
      });
  };

  const showPresent = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const result = await nftContract.methods
      .PRESENT(data.get("who_2"), data.get("number_2"))
      .call();
    const result2 = await nftContract.methods
      .getChargeRatio(data.get("who_2"), data.get("number_2"))
      .call();
    // console.log(result);
    // console.log(result2);
    setPresent(true);
    setCurrentB(Number(result.currentB));
    setFinalB(Number(result.finalB));
    setRatio(Number(result2));
  };

  const chargePresent = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    await nftContract.methods
      .chargeBalance(
        data.get("who_3"),
        data.get("number_3"),
        data.get("price_3")
      )
      .send({
        from: account,
      });
  };

  const getTokenURI = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const result = await nftContract.methods
      .tokenURI(data.get("tokenID_4"))
      .call();

    setTokenURI(result);
  };

  return (
    <div className="bg-blue-300 min-h-screen flex justify-center items-center">
      {account ? (
        <div>
          <div className="text-main font-bold text-xl ">
            {account.substring(0, 4)}...
            {account.substring(account.length - 4)}
            <button onClick={onClickLogOut} className="ml-4 btn-style">
              로그아웃
            </button>
          </div>
          <div className="flex items-center mt-4">
            <button onClick={onClickBalance} className="btn-style mr-4">
              잔액 조회
            </button>
            {balance && (
              <div className="text-main font-bold text-xl">
                {balance} goerli
              </div>
            )}
          </div>
          <form onSubmit={buyToken} className="mt-4">
            <input
              className="border-2 border-black"
              type="text"
              name="amount"
              placeholder="구매할 양을 입력하게요"
            ></input>
            <button className="ml-4 btn-style" type="submit">
              토큰 구매하기
            </button>
          </form>
          <div className="flex items-center mt-4">
            <button onClick={onClickToken} className="btn-style mr-4">
              토큰 조회
            </button>
            <div className="text-main font-bold text-xl">{token} CT</div>
          </div>
          <form onSubmit={submitPresent} className="mt-4">
            <input
              className="border-2 border-black mr-4"
              type="text"
              name="number_1"
              placeholder="몇번쨰 선물"
            ></input>
            <input
              className="border-2 border-black"
              type="text"
              name="price_1"
              placeholder="선물의 금액"
            ></input>
            <button className="ml-4 btn-style" type="submit">
              선물 등록하기
            </button>
          </form>
          <form onSubmit={showPresent} className="mt-4">
            <input
              className="border-2 border-black mr-4"
              type="text"
              name="who_2"
              placeholder="누구의 선물"
            ></input>
            <input
              className="border-2 border-black"
              type="text"
              name="number_2"
              placeholder="몇번쨰 선물"
            ></input>
            <button className="ml-4 btn-style" type="submit">
              선물 보기
            </button>
            {present && (
              <div className="text-main font-bold text-xl">
                {currentB} / {finalB} ({ratio}%)
              </div>
            )}
          </form>
          <form onSubmit={chargePresent} className="mt-4">
            <input
              className="border-2 border-black mr-4"
              type="text"
              name="who_3"
              placeholder="누구의 선물"
            ></input>
            <input
              className="border-2 border-black mr-4"
              type="text"
              name="number_3"
              placeholder="몇번쨰 선물"
            ></input>
            <input
              className="border-2 border-black"
              type="text"
              name="price_3"
              placeholder="선물의 금액"
            ></input>
            <button className="ml-4 btn-style" type="submit">
              돈 충전하기
            </button>
          </form>
          <form onSubmit={getTokenURI} className="mt-4">
            <input
              className="border-2 border-black"
              type="text"
              name="tokenID_4"
              placeholder="토큰 아이디"
            ></input>
            <button className="ml-4 btn-style" type="submit">
              해당 NFT의 URI 보기
            </button>
            <div className="text-main font-bold text-xl">{tokenURI}</div>
          </form>
          <div>
            <button className="btn-style mt-4" onClick={getCoinPrice}>
              환율보기
            </button>
            {coinPrice && (
              <div className="flex flex-col mt-4 text-main font-bold text-xl">
                <div>1 Matic : {coinPrice} K₩</div>
                <div>1 K₩ : {1 / coinPrice} Matic</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button onClick={onClickAccount} className="btn-style">
          버튼
        </button>
      )}
    </div>
  );
}

export default App;
