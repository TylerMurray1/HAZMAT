# HAZMAT Tracking Application

This repository contains the web application code for a HAZMAT tracking application.

### Installing

After cloning the repository using:
```
git clone repo.url
```
You need to run:

```
npm install
```

## Installing and Running Ethereum blockchain

First, go to this website and install the valid geth (Go-Ethereum) version:
* [Go Ethereum](https://geth.ethereum.org/downloads/) - Go Ethereum downloads page.

After doing this, you need to download an application called MIST:
* [MIST] (https://github.com/ethereum/mist/releases) - MIST downloads

This should be it in terms of downloading none Node.js packages. Now onto command line things.

1. puppeth is a program that comes the Go-Ethereum download. This is a manager for a private Ethereum network, which is the one that we are running. This will help generate your genesis block. The genesis block is the first block inside of the chain and has to be rendered before the blockchain is created. To do this:
* First, create a directory where you want the chain to be stored.
* Following this, cd into the directory you created. Go ahead and run puppeth by typing, puppeth into the command line.
```
puppeth
```
* You should be prompted with:
```
Please specify a network name to administer (no spaces, hyphens or capital letters please)
```
You can name this anything. I would name it the same as the directory you created where the chain is stored.

* After naming the private network, you will be prompted on what you will want to do. Choose option 2 to create a genesis block:
```
What would you like to do? (default = stats)
 1. Show network stats
 2. Configure new genesis
 3. Track new remote server
 4. Deploy network components
```

* After that, you will be prompted on what you want to do with the genesis block. Choose option 1:
```
What would you like to do? (default = create)
 1. Create new genesis from scratch
 2. Import already existing genesis
```

* After that, you will be prompted on what consensus engine to use. Choose option 2:
```
Which consensus engine to use? (default = clique)
 1. Ethash - proof-of-work
 2. Clique - proof-of-authority
```

* Following that, you can enter through all of the other options. If you ls in the current directory, there should be a genesis json block created.

2. After this, you are ready to initialize the chain. You can do this by running the following command:
```
geth -datadir=./chaindata init [name-of-genesis-block].json
```
* This will create a directory where the chain data will be stored called chaindata. It will initialize the chain using the genesis block. After this is done, you are now ready to start the chain.

3. Starting the chain involves runnings few commands. The first is:
```
geth -datadir=./chaindata
```
* This will create the server for the chain and start "running" the blockchain. You will want to run the next command to start the JavaScript Interface:
```
geth attach ipc:[absolute path to geth.ipc file in chaindata directory]
```

* To interact with the chain and create smart contracts, you can use MIST which we downloaded earlier. To open MIST, run:
```
/Applications/Mist.app/Contents/MacOS/Mist --rpc ~[absolute path to geth.ipc file in chaindata directory]
```

* Finally, you can make an account and create smart contracts from here.

4. Interacting with the chain from the web Application. First, you will need a few more node packages. Here they are:
```
npm install -g ethereumjs-testrpc
```
```
npm install web3 -save
```

* After installing these 2 node modules, you will want to run testrpc to initialize the link between the web application and the blockchain. To do this, run the command:
```
node_modules/.bin/testrpc
```

* After inserting the web3.eth code in your web app, you can run it using:
```
node server.js
```

* If you make it here, you are all set up! 






This will install all of the relevent node packages that you will need to develop on your local machine

## Setting up path

You will also need to alter the config.json fill to specify the path that your HAZMAT directory is located

## Built With

* [Node.js](https://nodejs.org/en/) - The web environment used for this project

## Authors

* **Tyler Murray** - *Main Programmer* - [TylerMurray](https://github.com/TylerMurray1)
* **Sam Pennington** - *Main Programmer* - [SamPennington](https://github.com/spennin5)
