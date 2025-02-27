import web3 from "./web3";

const abi = [
  {
    constant: false,
    inputs: [
      { name: "_hash_start", type: "bytes32" },
      { name: "_hash_end", type: "bytes32" },
      { name: "_pytpe", type: "bytes1" },
    ],
    name: "postProduct",
    outputs: [{ name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_hash", type: "bytes32" },
      { name: "_hashfunction", type: "uint8" },
      { name: "_size", type: "uint8" },
    ],
    name: "addProduct",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "indexed_from", type: "address" },
      { indexed: false, name: "hash_start", type: "bytes32" },
      { indexed: false, name: "hash_end", type: "bytes32" },
      { indexed: false, name: "ptype", type: "bytes1" },
    ],
    name: "PostProducts",
    type: "event",
  },
];
const address = "0x38A4efD7A5042B694fD138376D5279AEC8083e37";

export default new web3.eth.Contract(abi, address);
