const KVStore = require('../');
// const KVStore = require('@geekberry/solidity-kvstore');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const kvStoreAdmin = new KVStore({
    // conflux node url
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',

    // KVStore contract address
    address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',

    // admin privateKey
    account: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',

    // logger for debug
    logger: console,
  });

  console.log(await kvStoreAdmin.getRole(kvStoreAdmin.account));
  // NamedTuple(isReader,isWriter,isAdmin) [ true, true, true ]

  console.log(await kvStoreAdmin.set('key', 'value')); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStoreAdmin.get('key')); // as you see, set success!
  // <Buffer 76 61 6c 75 65>

  console.log(await kvStoreAdmin.removeWriter(kvStoreAdmin.account)); // return transaction hash
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStoreAdmin.getRole(kvStoreAdmin.account));
  // NamedTuple(isReader,isWriter,isAdmin) [ true, false, true ] // not writer any more

  try {
    console.log(await kvStoreAdmin.set('key', 'value')); // can not set
  } catch (e) {
    console.error(e); // set failed
  }

  /* set other user to read (or write) */
  const kvStoreReader = new KVStore({
    url: 'http://localhost:12537',
    address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
    account: '0x0123456789012345678901234567890123456789', // account address is enough for read
  });

  console.log(await kvStoreAdmin.getRole(kvStoreReader.account));
  // NamedTuple(isReader,isWriter,isAdmin) [ false, false, false ]

  try {
    await kvStoreReader.get('key');
  } catch (e) {
    console.error(e); // Permissions error!
  }

  console.log(await kvStoreAdmin.addReader(kvStoreReader.account));
  await sleep(5000); // you might need wait seconds here
  console.log(await kvStoreAdmin.getRole(kvStoreReader.account));
  // NamedTuple(isReader,isWriter,isAdmin) [ true, false, false ]

  console.log(await kvStoreReader.get('key')); // can read
  // <Buffer 76 61 6c 75 65>

  // use `await kvStoreAdmin.addWrite(address)` to allow account to write
}

main();
