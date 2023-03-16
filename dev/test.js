import Blockchain from "./blockchain.js";

const bitcoin = new Blockchain()
bitcoin.createNewBlock(1234, 'qdasfsd', '123414')
bitcoin.createNewTransaction(100, 'Alex', 'Jenn')
bitcoin.createNewBlock(2341, '234235sffgd', '123sdfdg2342414')
bitcoin.createNewTransaction(100, 'Alex', 'Jenn')
bitcoin.createNewTransaction(100, 'Alex', 'Jenn')
console.log(bitcoin)
console.log(bitcoin.getLastBlock())

const previousBlockHash = 'asfasudfhakdj2413'
const currentBlockData = [
    {
    amount: 10,
    sender: 'B4CE9C0E5CD571',
    recipient: '3A3F6E462D48E9',
    }
]
const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData)
console.log('Generating the hash')
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce))
console.log(nonce);


const chain = [
    {
    "index": 1,
    "timestamp": 1678806865259,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1678807029733,
    "transactions": [
    {
    "amount": 634,
    "sender": "ASDJHSAVD675SD9",
    "recipient": "IF09YWDV5868DKSH",
    "transactionId": "3e36ad10c27b11edaf05f908be893a6d"
    }
    ],
    "nonce": 67023,
    "hash": "0000433b076e66f0e64f2a6289c796350a463ab650f7e7b0e10ea474cf53612b",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1678807032442,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "e801e3b0c27a11edaf05f908be893a6d",
    "transactionId": "4a0d8780c27b11edaf05f908be893a6d"
    }
    ],
    "nonce": 54293,
    "hash": "0000c7153485f71bd1b8bbe9f052572d10d3480fe23774190b93d6d005d621a8",
    "previousBlockHash": "0000433b076e66f0e64f2a6289c796350a463ab650f7e7b0e10ea474cf53612b"
    },
    {
    "index": 4,
    "timestamp": 1678807034254,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "e801e3b0c27a11edaf05f908be893a6d",
    "transactionId": "4ba899e0c27b11edaf05f908be893a6d"
    }
    ],
    "nonce": 39984,
    "hash": "00001da06012fc4fcee9fa4a139f04a800c614e16be9d6afeac5da9eed9d39ee",
    "previousBlockHash": "0000c7153485f71bd1b8bbe9f052572d10d3480fe23774190b93d6d005d621a8"
    },
    {
    "index": 5,
    "timestamp": 1678807048461,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "e801e3b0c27a11edaf05f908be893a6d",
    "transactionId": "4cbd1720c27b11edaf05f908be893a6d"
    },
    {
    "amount": 6,
    "sender": "ASDJHSAVD675SD9",
    "recipient": "IF09YWDV5868DKSH",
    "transactionId": "520700b0c27b11edaf05f908be893a6d"
    }
    ],
    "nonce": 60903,
    "hash": "0000b32a30eed1548fd1d1cc29373b8be5eb66d9f3a29dcd9fec35d05a913b47",
    "previousBlockHash": "00001da06012fc4fcee9fa4a139f04a800c614e16be9d6afeac5da9eed9d39ee"
    }
]

console.log(`Valid : ${bitcoin.chainIsValid(chain)}`);