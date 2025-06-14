import { createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther, WalletClient, PublicClient, Chain, Address } from "viem";
import { contractAddress, abi } from "./constants-ts";
import "viem/window";

const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmountInput") as HTMLInputElement;
const balancebutton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;

let walletClient: WalletClient; 
let publicClient: PublicClient;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    await walletClient.requestAddresses();
  } else {
    if (connectButton) {
      connectButton.innerHTML = "Please install MetaMask!";
    }
  }
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} ETH`);
  
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);
    
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });
    
    const { request } = await publicClient.simulateContract({
      account: connectedAccount as Address,
      address: contractAddress as Address,
      abi: abi,
      functionName: "fund",
      chain: currentChain,
      value: parseEther(ethAmount),
    });
    
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    if (connectButton) {
      connectButton.innerHTML = "Please install MetaMask!";
    }
  }
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
    id: chainId,
    name: 'custom chain',
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

async function getbalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });
   
    const balance = await publicClient.getBalance({
      address: contractAddress as Address,
    });
    console.log(formatEther(balance));
  }
}

async function withdraw(): Promise<void> {
  console.log(`withdrawing...`);
  
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);
    
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });
    
    const { request } = await publicClient.simulateContract({
      account: connectedAccount as Address,
      address: contractAddress as Address,
      abi: abi,
      functionName: "withdraw",
      chain: currentChain,
    });
    
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    if (connectButton) {
      connectButton.innerHTML = "Please install MetaMask!";
    }
  }
}

if (connectButton) connectButton.onclick = connect;
if (fundButton) fundButton.onclick = fund;
if (balancebutton) balancebutton.onclick = getbalance;
if (withdrawButton) withdrawButton.onclick = withdraw;