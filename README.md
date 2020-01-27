# Faucet Usage

## Version
Use Node v11.14.0
sudo npm install

## To start faucet

1. Login to console.cloud.google.com
2. Start faucet VM
3. cd faucet
4. npm start

## Faucet API

Send Eths
http://ropstenfaucet.glitch.me/sendethers

1. Set POST
2. Set content-type in header as "application/x-www-form-urlencoded" 
3. set parameters as body

### Send Eths
http://ropstenfaucet.glitch.me/sendethers

Parameters:
- receiver: <address of wallet receiving this> e.g. 0xAa458F5c2bc53E6D93A8aCB41638A1af7e76C3B9
- request: <amount requested> e.g. 1

### Check amount of Eths in faucet
http://ropstenfaucet.glitch.me/ethers

Parameters: none

## To top up faucet

1. Go to Remix
2. Paste faucet.sol
3. provide ETH, press [Receive]
