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

    try {
      this.account = this.cfx.Account(account);
      this.nonce = undefined;
    } catch (e) {
      this.account = account;
    }

    this.contract = this.cfx.Contract({ abi, code, address });
    this._wrapABI(abi);
  }

  _wrapABI(abi) {
    this.constructor = this._wrapConstructor();

    abi.forEach(fragment => {
      switch (fragment.stateMutability) {
        case 'nonpayable':
          this[fragment.name] = this._wrapSend(fragment.name);
          break;

        case 'view':
          this[fragment.name] = this._wrapCall(fragment.name);
          break;

        default:
          break;
      }
    });
  }

  _wrapConstructor() {
    return async (...args) => {
      const { contractCreated } = await this.contract.constructor(...args)
        .sendTransaction({ from: this.account, to: null })
        .confirmed();
      return contractCreated;
    };
  }

  _wrapSend(name) {
    return async (...args) => {
      if (this.nonce === undefined) {
        this.nonce = await this.cfx.getTransactionCount(this.account);
      }

      try {
        const { transactionHash } = await this.contract[name](...args)
          .sendTransaction({ from: this.account, nonce: this.nonce })
          .confirmed();
        return transactionHash;
      } catch (e) {
        throw Error(`${name}(${args.join(',')}) ${e}`);
      } finally {
        this.nonce += 1;
      }
    };
  }

  _wrapCall(name) {
    return (...args) => {
      return this.contract[name](...args)
        .call({ from: this.account });
    };
  }
}

module.exports = KVStore;
