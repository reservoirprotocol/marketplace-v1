import Web3 from 'web3';

const web3 = new Web3('https://mainnet.infura.io/v3/1835809e0e6a4de38eaf1f7afb51e0ec');
const contractAddress = '0x5a0121a0a21232ec0d024dab9017314509026480';

const abi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function",
  },
];

export async function fetchFromContract(tokenId?: string): Promise<string> {
  // @ts-ignore
  const contract = new web3.eth.Contract(abi, contractAddress).methods.tokenURI(tokenId)
  return await contract.call();


}