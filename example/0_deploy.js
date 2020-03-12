const KVStore = require('../');
// const KVStore = require('@geekberry/solidity-kvstore');

async function main() {
  const kvStore = new KVStore({
    url: 'http://localhost:12537',
    // url: 'http://testnet-jsonrpc.conflux-chain.org:12537', // conflux test-net

    // account must be privateKey for deploy
    // this account will be admin of this database
    account: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',

    // logger for debug
    logger: console,
  });

  // get address
  const address = await kvStore.constructor(); // deploy the contract
  console.log(address); // 0x8bfc6fd9437cf1879fb84aade867b6e81efb5631
}

main();
