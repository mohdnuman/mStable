const Web3 = require("web3");

const Abi = require("./abi.json");
const Abi2 = require("./abi2.json");
const erc20 = require("./erc20.json");



let web3;

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/287af69fca9142f3b1681a93ce4c3afa"
);
web3 = new Web3(provider);


async function getData(address,contract) {

  const instance = new web3.eth.Contract(Abi, contract);

  const LPtokensReceived = await instance.methods.balanceOf(address).call();
  const totalSupplyLP= await instance.methods.totalSupply().call();
  let rewards=await instance.methods.unclaimedRewards(address).call();
  rewards=(rewards.amount/10**18).toFixed(2);

  const LPtoken=await instance.methods.stakingToken().call();

  const LPinstance=new web3.eth.Contract(Abi2,LPtoken);

  const info=await LPinstance.methods.getBassets().call();
  console.log(info);

  const token0=info[0][0][0];
  const token1=info[0][1][0];
  const token0instance=new web3.eth.Contract(erc20,token0);
  const token1instance=new web3.eth.Contract(erc20,token1);
  let symbol0=await token0instance.methods.symbol().call();
  let symbol1=await token1instance.methods.symbol().call();
  let decimals0=await token0instance.methods.decimals().call();
  let decimals1=await token1instance.methods.decimals().call();

  let reserve0=info.vaultData[0][1];
  let reserve1=info.vaultData[1][1];
  reserve0=reserve0/10**decimals0;
  reserve1=reserve1/10**decimals1;

  let token0amount=(((LPtokensReceived/totalSupplyLP)*reserve0)).toFixed(2);
  let token1amount=(((LPtokensReceived/totalSupplyLP)*reserve1)).toFixed(2);

  console.log(symbol0,'+',symbol1,token0amount,'+',token1amount);
  console.log('rewards:',rewards,'MTA')


}
let address = "0x0bf5ee128d559eef716172a2e535a700129d278f";

getData(address,"0xAdeeDD3e5768F7882572Ad91065f93BA88343C99");//mUSD/GUSD
getData(address,"0xD124B55f70D374F58455c8AEdf308E52Cf2A6207");//mUSD/BUSD
getData(address,"0xF65D53AA6e2E4A5f4F026e73cb3e22C22D75E35C");//mBTC/HBTC
getData(address,"0x760ea8CfDcC4e78d8b9cA3088ECD460246DC0731");//mBTC/TBTC



