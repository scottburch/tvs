import {$, cd} from 'zx'

const cwd = process.cwd();
console.log('cwd:', cwd);
process.setUncaughtExceptionCaptureCallback(err => console.log(err))

const options = [
     '--plugin=../../../node_modules/.bin/protoc-gen-ts_proto',
    '--ts_proto_opt=importSuffix=.js',
    '--ts_proto_opt=esModuleInterop=true',
     '--ts_proto_out='+cwd+'/generated',
    '--proto_path=../cometbft-0.38.12/proto',
    '--proto_path=../gogoproto',
    '--proto_path=../'
];

$`rm -rf ./generated`
    .then(() => $`mkdir ./generated`)
    .then(() => $`protoc ${options} tendermint/abci/types.proto`);