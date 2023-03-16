import express from 'express'
import bodyParser from 'body-parser'
import Blockchain from './blockchain.js';
import * as uuid from 'uuid';
import got from 'got';

const currentNodeUrl = process.argv[3];
const bitcoin = new Blockchain(currentNodeUrl);
const nodeAddress = uuid.v1().split('-').join('')

const port = process.argv[2];
const app = express();

app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send('Hello Coding Javascript UPDATED');
})

app.get('/blockchain', (req, res) => {
    res.json(bitcoin);
})

app.get('/mine', (req, res) => {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    // bitcoin.createNewTransaction(12.5, "0", nodeAddress);

    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + '/receive-new-block',
            method: "POST",
            json: {newBlock: newBlock}
        };

        requestPromises.push(got.post(requestOptions));
    })

    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            url: bitcoin.currentNodeUrl + "/transaction/broadcast",
            method: "POST",
            json: {
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            }
        }
        return got.post(requestOptions);
    })
    .then(data => {
        res.json({
            note: "New block mined successfully",
            block: newBlock
        });
    })
})

app.post('/receive-new-block', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if(correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({
            note: "New Block received and accepted",
            newBlock: newBlock
        })
    }

    else {
        res.json({
            note: "New Block Rejected",
            newBlock: newBlock
        })
    }
})




app.post('/transaction', (req, res) => {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    // const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({note: `Transaction will be added in block ${blockIndex}.`})
})

app.post('/transaction/broadcast', (req, res) => {
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + '/transaction',
            method: "POST",
            json: newTransaction
        }

        requestPromises.push(got.post(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        res.json({note: "Transaction created and broadcasted successfully."})
    })
})

app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1)
        bitcoin.networkNodes.push(newNodeUrl);

    // console.log("maybe it works")
    
    const regNodePromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + '/register-node',
            method: 'POST',
            json: {
                newNodeUrl: newNodeUrl
            }
        }
        
        regNodePromises.push(got.post(requestOptions))
    })

    Promise.all(regNodePromises)
    .then(data => {
        const bulkRegisterOptions = {
            url: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            json: {
                allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
            }
        };
        return got.post(bulkRegisterOptions);
    })
    .then(data => {
        res.json({note: 'New node registered with network successfully'})
    })
    // .catch(error => {
    //     console.log(error)
    // });
})

app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);

    res.json({note: "New node registered succesfully"});
})

app.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;

        if(nodeNotAlreadyPresent && notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });

    res.json({note: 'Bulk registration was successful.'})
})

app.get('/consensus', (req, res) => {
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + '/blockchain',
            method: "GET"
        };

        requestPromises.push(got.get(requestOptions));
    });
    Promise.all(requestPromises)
    .then(blockchains => {
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(response => {
            let blockchain = JSON.parse(response.body)
            if(blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            }
        });



        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            res.json({
                note: "Current chain has not been replaced",
                chain: bitcoin.chain
            });
        }
        else {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: "This chain has been replaced",
                chain: bitcoin.chain
            })
        }
    })
    .catch(error => {
        console.log(error);
    })
})

app.listen(port, () => {
    console.log('Listening on port ' + port + ' ...')
});