import {$} from 'zx'

const cwd = process.cwd();
console.log('cwd:', cwd);
process.setUncaughtExceptionCaptureCallback(err => console.log(err))

const options = [
     '--plugin=../../../node_modules/.bin/protoc-gen-ts_proto',
    '--ts_proto_opt=importSuffix=.js',
    '--ts_proto_opt=esModuleInterop=true',
     '--ts_proto_out='+cwd+'/generated',
    '--proto_path=../proto/cometbft-0.38.11/proto',
    '--proto_path=../proto/gogoproto',
    '--proto_path=../proto'
];

$`rm -rf generated`
    .then(() => $`mkdir generated`)
    .then(() => $`protoc ${options} tendermint/abci/types.proto`);