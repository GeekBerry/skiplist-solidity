const Conflux = require('@geekberry/js-conflux-sdk');
const { abi, code } = require('./KVStore.json');

class KVStore {
  constructor({
    url,
    address,
    account,
    logger,
  }) {
    this.cfx = new Conflux({ url, logger });
    this.contract = this.cfx.Contract({ abi, code, address });

    try {
      this.account = this.cfx.Account(account);
    } catch (e) {
      this.account = account;
    }

    abi.forEach(fragment => {
      switch (fragment.stateMutability) {
        case 'nonpayable':
          this[fragment.name] = async (...args) => {
            try {
              const { transactionHash } = await this.contract[fragment.name](...args)
                .sendTransaction({ from: this.account })
                .confirmed();

              return transactionHash;
            } catch (e) {
              throw Error(`${fragment.name}(${args.join(',')})`);
            }

          };
          break;

        case 'view':
          this[fragment.name] = (...args) => {
            return this.contract[fragment.name](...args)
              .call({ from: this.account });
          };
          break;

        default:
          break;
      }
    });

    this.constructor = async (...args) => {
      const { contractCreated } = await this.contract.constructor(...args)
        .sendTransaction({ from: this.account, to: null })
        .confirmed();

      return contractCreated;
    };
  }
}

module.exports = KVStore;
