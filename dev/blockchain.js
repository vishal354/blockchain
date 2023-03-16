import sha256 from "sha256";
import * as uuid from 'uuid';

export default class Blockchain {
    constructor(currentNodeUrl) {
        this.chain = [];
        this.pendingTransactions = [];
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];
        this.createNewBlock(100, '0', '0')
    }

    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };
        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction(amount, sender, recipient) {
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionId: uuid.v1().split('-').join('')
        };
        // this.pendingTransactions.push(newTransaction);

        // return this.getLastBlock()['index'] + 1;
        return newTransaction;
    }

    addTransactionToPendingTransactions(transactionObj) {
        this.pendingTransactions.push(transactionObj);
        return this.getLastBlock()['index'] + 1;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

    proofOfWork(previousBlockHash, currentBlockData) {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        while(hash.substring(0,4) != '0000') {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }

        return nonce;
    }

    chainIsValid(blockchain) {
        let validChain = true;
        for(var i=1; i<blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const prevBlock = blockchain[i-1];
            const currentBlockData = {
                transactions: currentBlock['transactions'],
                index: currentBlock['index']
            };
            const blockHash = this.hashBlock(prevBlock['hash'], currentBlockData, currentBlock['nonce']);

            if(blockHash.substring(0,4) !== '0000') {
                validChain = false;
                break;
            }

            if(currentBlock['previousBlockHash'] !== prevBlock['hash']) {
                validChain = false;
                break;
            }
        }

        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock['nonce'] === 100;
        const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
        const correctHash = genesisBlock['hash'] === '0';
        const correctTransactions = genesisBlock['transactions'].length === 0;

        if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
            validChain = false;
        }

        return validChain;
    }
}