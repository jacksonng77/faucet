var express = require("express"),
  parser = require("body-parser"),
  http = require("http");

var Web3 = require("web3"),
  webtx = require("ethereumjs-tx");

var web3 = new Web3(
  new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/<your api key>')
);

var walletaddress = "<your wallet address>";
var key = "<your wallet private key>";
var myinterface = [
  {
    constant: false,
    inputs: [],
    name: "receive",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_requester", type: "address" },
      { name: "_request", type: "uint256" }
    ],
    name: "send",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    payable: true,
    stateMutability: "payable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_amountsent", type: "uint256" }],
    name: "sent",
    type: "event"
  },
  { anonymous: false, inputs: [], name: "received", type: "event" },
  {
    constant: true,
    inputs: [],
    name: "me",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "requesters",
    outputs: [
      { name: "requesteraddress", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
var faucetaddress = "0x0Cc0782E381ACf8840ebeA88Bab61865043F2D3C";

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.set("port", process.env.PORT || 5000);

const executeContractTransaction = async (
  _contractAddress,
  _wallet,
  _encodedABI,
  _key,
  _gasLimit,
  _gasPrice,
  _gas,
  contractTransactionExecutedCallback
) => {
  web3.eth.getTransactionCount(_wallet).then(txCount => {
    const txOptions = {
      from: _wallet,
      to: _contractAddress,
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(_gasLimit),
      gasPrice: web3.utils.toHex(_gasPrice),
      gas: web3.utils.toHex(_gas),
      data: _encodedABI
    };
    var tx = new webtx(txOptions);
    var privateKey = new Buffer(_key, "hex");
    tx.sign(privateKey);
    var serializedTx = tx.serialize();

    web3.eth
      .sendSignedTransaction("0x" + serializedTx.toString("hex"))
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log("=> confirmation: " + confirmationNumber);
      })
      .on("transactionHash", hash => {
        console.log("=> hash");
        console.log(hash);
      })
      .on("error", console.error)
      .then(receipt => {
        //console.log('=> reciept');
        //console.log(receipt);
        contractTransactionExecutedCallback(receipt);
      });
  });
};

// Set default route
app.get("/", function(req, res) {
  res.send("<html><body><p>Welcome to Ethereum Faucet</p></body></html>");
});

// Create server
http.createServer(app).listen(app.get("port"), function() {
  console.log("Server listening on port " + app.get("port"));
});

// State ETH balance in faucet
app.post("/ethers", function(req, res) {
  try {
    web3.eth.getBalance(faucetaddress).then(balance => {
      res.setHeader("Content-Type", "application/json");
      res
        .status(200)
        .send(
          JSON.stringify({ ethbalance: web3.utils.fromWei(balance, "ether") })
        );
    });
  } catch (err) {
    var obj = { ethbalance: -1 };
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(obj));
  }
});

// send ETH

app.post("/sendethers", async function(req, res) {
  if (
    typeof req.body.receiver == "undefined" ||
    typeof req.body.request == "undefined"
  ) {
    res.setHeader("Content-Type", "application/json");
    res
      .status(400)
      .send(
        JSON.stringify({
          result: "error",
          msg: "error in receiver and/or request fields"
        })
      );
    return;
  }

  let receiver = req.body.receiver;
  let request = req.body.request;

  console.log(receiver);
  console.log(request);

  try {
    const contract = new web3.eth.Contract(myinterface, faucetaddress);

    const query = contract.methods.send(receiver, request);
    const encodedABI = query.encodeABI();

    let myeth_old, myeth_new;

    await web3.eth.getBalance(receiver).then(balance => {
      myeth_old = web3.utils.fromWei(balance, "ether");
    });

    const contractTransactionExecuted = async receipt => {
      await web3.eth.getBalance(receiver).then(balance => {
        myeth_new = web3.utils.fromWei(balance, "ether");
      });

      var obj = { ethsent: myeth_new - myeth_old };
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(obj));
    };

    executeContractTransaction(
      faucetaddress,
      walletaddress,
      encodedABI,
      key,
      9000000,
      20000000000,
      5000000,
      contractTransactionExecuted
    );
  } catch (err) {
    var obj = { ethsent: -1 };
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(obj));
  }
});
