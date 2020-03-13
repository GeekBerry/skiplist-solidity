// const KVStore = require('@geekberry/solidity-kvstore');
const KVStore = require('../');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
async function main() {
  const kvStore = new KVStore({
    // url: 'http://testnet-jsonrpc.conflux-chain.org:12537', // conflux test-net
    url: 'http://localhost:12537',

    // KVStore contract address
    address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',

    // account must be writer privateKey for write
    account: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',

    // logger: console, // for debug
  });

  console.log(await kvStore.cfx.getBalance(kvStore.account)); // check balance

  /* set value */
  console.log(await kvStore.set(Buffer.from([0x45]), Buffer.from([0x65]))); // return transaction hash
  console.log(await kvStore.set(Buffer.from([0x43]), Buffer.from([]))); // return transaction hash
  console.log(await kvStore.set(Buffer.from([0x49]), 'string')); // return transaction hash
  console.log(await kvStore.set(Buffer.from([0x47]), Buffer.from(''))); // return transaction hash

  await sleep(5000); // you might need wait seconds here

  /* get value */
  console.log(await kvStore.size()); // 4n

  console.log(await kvStore.get(Buffer.from([0x43]))); // <Buffer > value set by empty Buffer
  console.log(await kvStore.get(Buffer.from([0x44]))); // <Buffer > not exist return empty Buffer

  console.log(await kvStore.has(Buffer.from([0x43]))); // true
  console.log(await kvStore.has(Buffer.from([0x44]))); // false

  /* list(key, limit, reverse) */
  console.log(await kvStore.list(Buffer.from([]), 10000, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 43>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 45>, <Buffer 65> ],
  //   NamedTuple(key,value) [ <Buffer 47>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 49>, <Buffer 73 74 72 69 6e 67> ]
  // ]

  console.log(await kvStore.list(Buffer.from([0x44]), 2, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 45>, <Buffer 65> ],
  //   NamedTuple(key,value) [ <Buffer 47>, <Buffer > ]
  // ]

  console.log(await kvStore.list(Buffer.from([0x44]), 2, true));
  // [
  //   NamedTuple(key,value) [ <Buffer 43>, <Buffer > ]
  // ]

  /* delete value */
  console.log(await kvStore.del(Buffer.from([0x45]))); // return transaction hash
  console.log(await kvStore.del(Buffer.from([0x46]))); // return transaction hash

  await sleep(5000); // you might need wait seconds here

  console.log(await kvStore.size()); // 3n
  console.log(await kvStore.list(Buffer.from([]), 10000, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 43>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 47>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 49>, <Buffer 73 74 72 69 6e 67> ]
  // ]

  /* clear */
  console.log(await kvStore.clear()); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.size()); // 0n
  console.log(await kvStore.list(Buffer.from([]), 10000, false)); // []
}

main();
