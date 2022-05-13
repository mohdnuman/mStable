const Web3 = require("web3");

const Abi = require("./abi.json");
const LP = require("./LP.json");
const Abi2 = require("./abi2.json");
const Abi3 = require("./abi3.json");
const Abi4 = require("./abi4.json");
const poolAbi=require("./poolAbi.json");
const poolAbiUni=require("./poolAbiUni.json");

const vaultAbi=require("./vaultAbi.json");
const MusdwRewards=require("./musdStaking.json");

const erc20 = require("./erc20.json");

let web3;

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/287af69fca9142f3b1681a93ce4c3afa"
);
web3 = new Web3(provider);

async function getFarmingData(address, contract) {
  const instance = new web3.eth.Contract(Abi, contract);

  let LPtokensReceived = await instance.methods.rawBalanceOf(address).call();
  // LPtokensReceived=LPtokensReceived/9;
  // if(LPtokensReceived!=0){
  // let boost=await instance.methods.getBoost(address).call();
  // LPtokensReceived=LPtokensReceived+boost;
  // }
  const totalSupplyLP = await instance.methods.totalSupply().call();
  let rewards = await instance.methods.unclaimedRewards(address).call();
  rewards = (rewards.amount / 10 ** 18).toFixed(2);

  const LPtoken = await instance.methods.stakingToken().call();

  const LPinstance = new web3.eth.Contract(LP, LPtoken);

  const info = await LPinstance.methods.getBassets().call();
  // console.log(info);

  const token0 = info[0][0][0];
  const token1 = info[0][1][0];
  const token0instance = new web3.eth.Contract(erc20, token0);
  const token1instance = new web3.eth.Contract(erc20, token1);
  let symbol0 = await token0instance.methods.symbol().call();
  let symbol1 = await token1instance.methods.symbol().call();
  let decimals0 = await token0instance.methods.decimals().call();
  let decimals1 = await token1instance.methods.decimals().call();

  let reserve0 = info.vaultData[0][1];
  let reserve1 = info.vaultData[1][1];
  reserve0 = reserve0 / 10 ** decimals0;
  reserve1 = reserve1 / 10 ** decimals1;

  let token0amount = ((LPtokensReceived / totalSupplyLP) * reserve0).toFixed(2);
  let token1amount = ((LPtokensReceived / totalSupplyLP) * reserve1).toFixed(2);

  if(token0amount!=0 && token1amount!=0){
  console.log(symbol0, "+", symbol1, token0amount, "+", token1amount);
  console.log("rewards:", rewards, "MTA");
  }
}

async function getFarmingMUSDData1(address, contract) {
  const instance = new web3.eth.Contract(MusdwRewards, contract);

  let balance=await instance.methods.rawBalanceOf(address).call();
  let rewards=await instance.methods.unclaimedRewards(address).call();

  balance=(balance/10**18).toFixed(2);
  rewards=(rewards.amount/10**18).toFixed(2);

  if(balance!=0){
  console.log('balance',balance,"mUSD");
  console.log('rewards',rewards,"MTA");
  }
}

async function getFarmingMUSDData2(address, contract) {
  const instance = new web3.eth.Contract(MusdwRewards, contract);

  let balance=await instance.methods.balanceOfUnderlying(address).call();

  balance=(balance/10**18).toFixed(2);

  if(balance!=0){
  console.log('balance',balance,"mUSD");
  }
}

async function getFarmingPoolData(address, contract) {
  const instance = new web3.eth.Contract(Abi4, contract);

  let stakedToken=await instance.methods.stakingToken().call();

  let balance=await instance.methods.balanceOf(address).call();
  let totalSupply=await instance.methods.totalSupply().call();
  let rewards=await instance.methods.earned(address).call();

  let rewardToken=await instance.methods.rewardsToken().call();
  let rewardsInstance=new web3.eth.Contract(erc20,rewardToken);
  let RewardSymbol=await rewardsInstance.methods.symbol().call();
  let RewardDecimals=await rewardsInstance.methods.decimals().call();
  rewards=(rewards/10**RewardDecimals).toFixed(2);

  const poolInstance=new web3.eth.Contract(poolAbiUni,stakedToken);
  let tokenReserves=await poolInstance.methods.getReserves().call();
  let reserve0=tokenReserves[0];
  let reserve1=tokenReserves[1];
  let token0contract=await poolInstance.methods.token0().call();
  let token1contract=await poolInstance.methods.token1().call();


  const token0=new web3.eth.Contract(erc20,token0contract);
  const token1=new web3.eth.Contract(erc20,token1contract);
  let symbol0=await token0.methods.symbol().call();
  let symbol1=await token1.methods.symbol().call();
  let decimals0=await token0.methods.decimals().call();
  let decimals1=await token1.methods.decimals().call();

  reserve0=reserve0/10**decimals0;
  reserve1=reserve1/10**decimals1;

  let token0amount=(balance/totalSupply*reserve0).toFixed(2);
  let token1amount=(balance/totalSupply*reserve1).toFixed(2);

  if(token0amount!=0 && token1amount!=0){
  console.log(symbol0,'+',symbol1,token0amount,'+',token1amount);
  console.log('rewards',rewards,RewardSymbol)
  }



}




async function getLockedStakingData(address, contract) {
  const instance = new web3.eth.Contract(Abi3, contract);

  let balance = await instance.methods.locked(address).call();
  let unlock = balance.end;
  balance = balance.amount;

  let rewards = await instance.methods.earned(address).call();

  balance = (balance / 10 ** 18).toFixed(2);
  rewards = (rewards / 10 ** 18).toFixed(2);

  var d = new Date(0); 
  d.setUTCSeconds(unlock);

  if(balance!=0){
  console.log("balance", balance, "MTA");
  console.log("rewards", rewards, "MTA");
  console.log("unlock time", d);
  }
}

async function getStakingData(address, contract) {
  const instance = new web3.eth.Contract(Abi2, contract);

  let balance=await instance.methods.rawBalanceOf(address).call();
  let rewards=await instance.methods.earned(address).call();
  let symbol=await instance.methods.symbol().call();
  let rewardToken=await instance.methods.getRewardToken().call();

  const rewardInstance=new web3.eth.Contract(erc20,rewardToken);
  let rewardSymbol=await rewardInstance.methods.symbol().call();
 
  balance=(balance[0]/10**18).toFixed(2);
  rewards=(rewards/10**18).toFixed(2);

  if(balance!=0){
  console.log('balance',balance,symbol.slice(3));
  console.log('rewards',rewards,rewardSymbol);
  }
}

async function getStakingBalancerPoolData(address, contract) {
  const instance = new web3.eth.Contract(Abi2, contract);

  let stakedToken=await instance.methods.STAKED_TOKEN().call();

  let balance=await instance.methods.balanceOf(address).call();
  let totalSupply=await instance.methods.totalSupply().call();
  let rewards=await instance.methods.earned(address).call();

  let rewardToken=await instance.methods.REWARDS_TOKEN().call();
  let rewardsInstance=new web3.eth.Contract(erc20,rewardToken);
  let RewardSymbol=await rewardsInstance.methods.symbol().call();
  let RewardDecimals=await rewardsInstance.methods.decimals().call();
  rewards=(rewards/10**RewardDecimals).toFixed(2);

  const poolInstance=new web3.eth.Contract(poolAbi,stakedToken);
  let vault=await poolInstance.methods.getVault().call();
  let poolId=await poolInstance.methods.getPoolId().call();

  const vaultInstance=new web3.eth.Contract(vaultAbi,vault);
  let poolInfo=await vaultInstance.methods.getPoolTokens(poolId).call();

  const token0=new web3.eth.Contract(erc20,poolInfo.tokens[0]);
  const token1=new web3.eth.Contract(erc20,poolInfo.tokens[1]);
  let symbol0=await token0.methods.symbol().call();
  let symbol1=await token1.methods.symbol().call();
  let decimals0=await token0.methods.decimals().call();
  let decimals1=await token1.methods.decimals().call();

  let reserve0=poolInfo.balances[0];
  let reserve1=poolInfo.balances[1];
  reserve0=reserve0/10**decimals0;
  reserve1=reserve1/10**decimals1;

  let token0amount=(balance/totalSupply*reserve0).toFixed(2);
  let token1amount=(balance/totalSupply*reserve1).toFixed(2);

  if(token0amount!=0 && token1amount!=0){
  console.log(symbol0,'+',symbol1,token0amount,'+',token1amount);
  console.log('rewards',rewards,RewardSymbol)
  }
}


let address = "0x66f4856f1bbd1eb09e1c8d9d646f5a3a193da569";

//Farming
getFarmingData(address,"0xAdeeDD3e5768F7882572Ad91065f93BA88343C99");//mUSD/GUSD
getFarmingData(address,"0xD124B55f70D374F58455c8AEdf308E52Cf2A6207");//mUSD/BUSD
getFarmingData(address,"0xF65D53AA6e2E4A5f4F026e73cb3e22C22D75E35C");//mBTC/HBTC
getFarmingData(address,"0x760ea8CfDcC4e78d8b9cA3088ECD460246DC0731");//mBTC/TBTC
getFarmingMUSDData1(address,"0x78BefCa7de27d07DC6e71da295Cc2946681A6c7B");//mUSD with rewards
getFarmingPoolData(address,"0x9B4abA35b35EEE7481775cCB4055Ce4e176C9a6F") //MTA/WETH uniswap

//Liquidity Pool
getFarmingMUSDData2(address,"0x30647a72Dc82d7Fbb1123EA74716aB8A317Eac19");//mUSD without rewards


//Locked
getLockedStakingData(address, "0xaE8bC96DA4F9A9613c323478BE181FDb2Aa0E1BF"); //locked MTA

//staking
getStakingData(address, "0x8f2326316eC696F6d023E37A9931c2b2C177a3D7"); //MTA
getStakingBalancerPoolData(address, "0xeFbe22085D9f29863Cfb77EEd16d3cC0D927b011"); //MTA/WETH balancer pool


