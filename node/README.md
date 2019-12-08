# Faucet Usage

## Version
Use Node v11.14.0
sudo npm install

## To start faucet

1. Login to console.cloud.google.com
2. Start faucet VM
3. cd faucet
4. npm start
5. remember to off the faucet VM when done testing. I am paying!!

## Faucet API

Send Eths
http://34.74.229.168:5000/sendethers

1. Set POST
2. Set content-type in header as "application/x-www-form-urlencoded" 
3. set parameters as body

### Send Eths
http://34.74.229.168:5000/sendethers

Parameters:
- receiver: <address of wallet receiving this> e.g. 0xAa458F5c2bc53E6D93A8aCB41638A1af7e76C3B9
- request: <amount requested> e.g. 1

### Check amount of Eths in faucet
http://34.74.229.168:5000/ethers

Parameters: none

## To top up faucet

1. Go to Remix
2. Enter faucet.sol
3. Faucet address: 0xcfb01ffceb2d2f88ec330656320058b65adea092
3. provide ETH, press [Receive]

## To code in React-Native Expo to call these RESTFul API
https://docs.expo.io/versions/latest/react-native/network/
