import {createWalletClient,custom ,createPublicClient,parseEther,defineChain,formatEther} from "https://esm.sh/viem";
import { contractAddress ,abi} from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmountInput");
const balancebutton = document.getElementById("balanceButton");
let walletClient;
let publicClient;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    await walletClient.requestAddresses();
  }
  else{
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} ETH`); 
  if(typeof window.ethereum !== "undefined"){
  walletClient= createWalletClient({
   transport : custom(window.ethereum)
  })
  const [connectedAccount] = await walletClient.requestAddresses();
  const currentChain = await getCurrentChain(walletClient)
  publicClient = createPublicClient({
    transport : custom(window.ethereum)
  })
  const {request} = await publicClient.simulateContract({
    account:connectedAccount,
    address: contractAddress,
    abi:abi,
    functionName:"fund",
    chain:currentChain,
    value:parseEther(ethAmount),
   
  })
  console.log(request)
  const hash = await walletClient.writeContract(request)
  console.log(hash)
  }
  else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
 
}

async function getCurrentChain(client) {

    const chainId = await client.getChainId();
    const currentChain = defineChain({
      id: chainId,
      name:'custom chain',
      nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: {
          http: ['https://localhost:8545'],
        },
      },
    });
    return currentChain;
  
}

async function getbalance() { 

  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });
   
    const balance = await publicClient.getBalance({
      address: contractAddress,
    });
    console.log(formatEther(balance));
  }


}

connectButton.onclick = connect;

fundButton.onclick = fund;

balancebutton.onclick = getbalance;
