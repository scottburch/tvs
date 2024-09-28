import {bufferCount, from, last, map, mergeMap, of, switchMap, tap} from "rxjs";
import {homedir} from "node:os";
import {$, fs} from 'zx'
import {parseToml, stringifyToml, tomlSet} from "./tomlParser.js";
import {get, update} from "./OrderedMap.js";
import {startApp} from "@tvs/blockchain";


export type NodeConfig = {
    name: string
}

export type SwarmConfig = {
    chainId: string
    nodes: NodeConfig[]
    validators: NodeConfig[]
}


export const startSwarm = (config: SwarmConfig, startAppFn: typeof startApp = startApp) =>
    createBaseTestnet(config).pipe(
        switchMap(() => setDirNames(config)),
        switchMap(() => setIpAddresses(config)),
        switchMap(() => setChainId(config)),
        switchMap(() => updatePersistentPeers(config)),
        switchMap(() => startNodes(config, startAppFn)),
    );


const startNodes = (config: SwarmConfig, startAppFn: typeof startApp = startApp) =>
    from([...config.validators, ...config.nodes]).pipe(
         mergeMap((n, idx) => startAppFn({
            appVersion: 1,
            version: '1.0.0',
            home: getBaseDir(n.name),
            apiPort: 1234 + idx,
             msgHandlers: {},
             queryHandlers: {}
        }).pipe(
            tap(() => console.log('Started node: ', n.name))
         )),
        bufferCount(config.validators.length + config.nodes.length),
    );

const updatePersistentPeers = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap(n => of(undefined).pipe(
            switchMap(() => readConfigFile(n)),
            switchMap(config => parseToml(config)),
            switchMap(toml => of(undefined).pipe(
                map(() => get<string>(toml, 'p2p.persistent_peers')),
                map(peers => peers.split(',')),
                map(peers => peers.map((it, idx) => it.replace(/^(.*:).*$/, '$1' + (26656 + 10 * idx).toString()))),
                map(peers => peers.map(it => it.replace(/(.*@).*(:.*)/, '$1localhost$2'))),
                map(peers => peers.join(',')),
                map(peers => update(toml, 'p2p.persistent_peers', peers)),
                switchMap(toml => stringifyToml(toml)),
                switchMap(toml => writeConfigFile(n, toml))
            )),
        )),
        last()
    )

const readConfigFile = (node: NodeConfig) =>
    fs.readFile(getBaseDir(`${node.name}/config/config.toml`)).then(buf => buf.toString());

const writeConfigFile = (node: NodeConfig, toml: string) =>
    fs.writeFile(getBaseDir(`${node.name}/config/config.toml`), toml)

const readGenesisFile = (node: NodeConfig) =>
    fs.readFile(getBaseDir(`${node.name}/config/genesis.json`)).then(buf => buf.toString());

const writeGenesisFile = (node: NodeConfig, json: string) =>
    fs.writeFile(getBaseDir(`${node.name}/config/genesis.json`), json)


const setChainId = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap(n => of(undefined).pipe(
            switchMap(() => readGenesisFile(n)),
            map(json => JSON.parse(json)),
            map(genesis => ({...genesis, chain_id: config.chainId})),
            switchMap(json => writeGenesisFile(n, JSON.stringify(json, null, '    ')))
        )),
        last()
    )

const setIpAddresses = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap((n, idx) => of(undefined).pipe(
            switchMap(() => readConfigFile(n)),
            switchMap(config => parseToml(config)),
            map(toml => tomlSet(toml, 'proxy_app', `tcp://127.0.0.1:${26658 + (10 * idx)}`)),
            map(toml => tomlSet(toml, 'rpc.laddr', `tcp://127.0.0.1:${26657 + (10 * idx)}`)),
            map(toml => tomlSet(toml, 'p2p.laddr', `tcp://127.0.0.1:${26656 + (10 * idx)}`)),
            switchMap(toml => stringifyToml(toml)),
            switchMap(toml => writeConfigFile(n, toml))
        )),
        last()
    );

const createBaseTestnet = (config: SwarmConfig) =>
    from(fs.promises.rm(getBaseDir(), {force: true, recursive: true})).pipe(
        map(() => [
            'testnet',
            '--o',
            getBaseDir(),
            '--n',
            config.nodes.length,
            '--v',
            config.validators.length
        ]),
        map(args => [...args, ...([...config.nodes, ...config.validators]).flatMap(n => (['--hostname', n.name]))]),
        switchMap(args => $`cometbft ${args}`),
        last()
    );

const setDirNames = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap((n, idx) => fs.rename(getBaseDir(`node${idx}`), getBaseDir(n.name))),
        last()
    )

const getBaseDir = (subdir: string = '') => `${homedir()}/.tvs-test/${subdir}`


