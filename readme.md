# solidity-kvstore

Solidity implemented kv store with role control.

## Installation

`npm i @geekberry/solidity-kvstore`

## Usage

> NOTE: string type might be Buffer

```javascript
const KVStore = require('@geekberry/solidity-kvstore');

const kvStore = new KVStore({
    // conflux node url
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
    
    // KVStore contract address
    address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
    
    // account must be privateKey for write
    account: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    
    // logger for debug
    logger: console,
});

async function main() {
  await kvStore.set('key1', 'value1');
  await kvStore.set('key2', 'value2');
  await kvStore.set('key3', 'value3');
  await kvStore.set('key4', 'value4');

  console.log(await kvStore.size()); // 4
  
  console.log(await kvStore.has('key99')); // false
  console.log(await kvStore.get('key1')); // 'value1' buffer

  console.log(await kvStore.list('', 3, false));
  // [
  //   {key:'key1', value:'value1'},
  //   {key:'key2', value:'value2'},
  //   {key:'key3', value:'value3'},
  // ]

  console.log(await kvStore.list('key2', 10000, true)); // set a large limit
  // [
  //   {key:'key2', value:'value2'},
  //   {key:'key1', value:'value1'},
  // ]

  await kvStore.del('key3');
  await kvStore.clear();
}

main()
```

## Example

* [deploy](https://github.com/GeekBerry/skiplist-solidity/blob/master/example/0_deploy.js)
* [curd](https://github.com/GeekBerry/skiplist-solidity/blob/master/example/1_curd.js)
* [role](https://github.com/GeekBerry/skiplist-solidity/blob/master/example/2_role.js)
