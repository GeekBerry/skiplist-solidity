const fs = require('fs');
const path = require('path');
const solc = require('solc');

function importFile(filename) {
  const contents = fs.readFileSync(filename).toString();
  return { contents };
}

function compileFile(filename) {
  const input = {
    language: 'Solidity',
    sources: {
      [filename]: {
        content: fs.readFileSync(filename).toString(),
      },
    },
    settings: { outputSelection: { '*': { '*': ['*'] } } },
  };

  const inputJson = JSON.stringify(input);
  const outputJson = solc.compile(inputJson, {
    import: importFile,
  });
  return JSON.parse(outputJson);
}

function compile(filename, dir) {
  const output = compileFile(filename);
  if (output.errors) {
    output.errors.forEach(e => {
      switch (e.severity) {
        case 'warning':
          console.error(e.formattedMessage);
          break;

        case 'error':
          throw new Error(e.formattedMessage);

        default:
          break;
      }
    });
  }

  Object.entries(output.contracts[filename])
    .forEach(([name, contract]) => {
      const object = {
        abi: contract.abi,
        code: `0x${contract.evm.bytecode.object}`,
      };

      fs.writeFileSync(
        path.format({ dir, name, ext: '.json' }),
        JSON.stringify(object, null, 2),
      );
    });
}

// ============================================================================
compile(`${__dirname}/contract/KVStore.sol`, `${__dirname}/src`);
