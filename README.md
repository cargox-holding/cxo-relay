# CXO Relay

This is the official CXO relay app.

## Installing dependencies

To install dependencies just run

```
yarn
```

## Running the development server

```
yarn dev
```

## Building the project

```
yarn build
electron-builder
```

# CXO Relay CLI

You can use the CXO relay also via its CLI

## CXO Relay CLI

To install globally just run

```
cd cxo-relay/
yarn add global file:$PWD
```

## Running the development server

Example execution

```
cxo-relay --key "this is an example mnemonic or private key" --relayUrl http://example/relay --rpcUrl http://example/rpc --rewardAddr 0x1000000000000000000000000000000000000001
```
