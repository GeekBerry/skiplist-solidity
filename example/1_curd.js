const KVStore = require('../');
// const KVStore = require('@geekberry/solidity-kvstore');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
async function main() {
  const kvStore = new KVStore({
    // conflux node url
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',

    // KVStore contract address
    address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',

    // account must be writer privateKey for write
    account: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',

    // logger for debug
    logger: console,
  });

  /* set value */
  console.log(await kvStore.set(Buffer.from([0x5]), Buffer.from([0xff]))); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.set(Buffer.from([0x3]), Buffer.from([]))); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.set(Buffer.from([0x9]), 'string')); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.set(Buffer.from([0x7]), Buffer.from(''))); // return transaction hash

  /* get value */
  console.log(await kvStore.size()); // 4n

  console.log(await kvStore.get(Buffer.from([0x3]))); // <Buffer > value set by empty Buffer
  console.log(await kvStore.get(Buffer.from([0x4]))); // <Buffer > not exist return empty Buffer

  console.log(await kvStore.has(Buffer.from([0x3]))); // true
  console.log(await kvStore.has(Buffer.from([0x4]))); // false

  /* list(key, limit, reverse) */
  console.log(await kvStore.list(Buffer.from([]), 10000, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 03>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 05>, <Buffer ff> ],
  //   NamedTuple(key,value) [ <Buffer 07>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 09>, <Buffer 73 74 72 69 6e 67> ]
  // ]

  console.log(await kvStore.list(Buffer.from([0x4]), 2, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 05>, <Buffer ff> ],
  //   NamedTuple(key,value) [ <Buffer 07>, <Buffer > ]
  // ]

  console.log(await kvStore.list(Buffer.from([0x4]), 2, true));
  // [
  //   NamedTuple(key,value) [ <Buffer 03>, <Buffer > ]
  // ]

  /* delete value */
  console.log(await kvStore.del(Buffer.from([0x5]))); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.del(Buffer.from([0x6]))); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.size()); // 3n
  console.log(await kvStore.list(Buffer.from([]), 10000, false));
  // [
  //   NamedTuple(key,value) [ <Buffer 03>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 07>, <Buffer > ],
  //   NamedTuple(key,value) [ <Buffer 09>, <Buffer 73 74 72 69 6e 67> ]
  // ]

  /* clear */
  console.log(await kvStore.clear()); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStore.size()); // 0n
  console.log(await kvStore.list(Buffer.from([]), 10000, false)); // []
}

main();
