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

## Prerequisites

You need [node and npm](https://nodejs.org/en/download/) to run the CLI. We recommend using the latest node version or at least v14.18.0.

## Installation

Install the latest cxo-relay version using npm

```
npm i -g cxo-relay
```

Example execution

```
cxo-relay --key "this is an example mnemonic or private key" --relayUrl http://example/relay --rpcUrl http://example/rpc --rewardAddr 0x1000000000000000000000000000000000000001
```

To install from source, clone the repository and run

```
cd cxo-relay/
yarn build-cli
yarn add global file:$PWD
```
