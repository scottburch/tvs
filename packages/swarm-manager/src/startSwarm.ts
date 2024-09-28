import {from, map, mergeMap, of, switchMap, tap} from "rxjs";
import {homedir} from "node:os";
import {$, fs} from 'zx'
import {parseToml, stringifyToml, tomlSet} from "./tomlParser.js";


export type NodeConfig = {
    name: string
}

export type SwarmConfig = {
    chainId: string
    nodes: NodeConfig[]
    validators: NodeConfig[]
}

export const startSwarm = (config: SwarmConfig) =>
    createBaseTestnet(config).pipe(
        switchMap(() => setDirNames(config)),
        switchMap(() => setIpAddresses(config)),
        switchMap(() => setChainId(config)),
        tap(() => console.log(`Swarm Created in ${getBaseDir()}`)),

    );

const setChainId = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap(n => of(undefined).pipe(
            switchMap(() => fs.readFile(getBaseDir(`${n.name}/config/genesis.json`))),
            map(json => JSON.parse(json.toString())),
            map(genesis => ({...genesis, chain_id: config.chainId})),
        ))
    )

const setIpAddresses = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap((n, idx) => of(undefined).pipe(
            switchMap(() => fs.readFile(getBaseDir(`${n.name}/config/config.toml`))),
            switchMap(buf => parseToml(buf.toString())),
            map(toml => tomlSet(toml, 'proxy_app', `127.0.0.1:${26658 + (10 * idx)}`)),
            map(toml => tomlSet(toml, 'rpc.laddr', `127.0.0.1:${26657 + (10 * idx)}`)),
            map(toml => tomlSet(toml, 'p2p.laddr', `127.0.0.1:${26656 + (10 * idx)}`)),
            switchMap(toml => stringifyToml(toml)),
            switchMap(toml => fs.writeFile(getBaseDir(`${n.name}/config/config.toml`), toml))
        )),
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
        switchMap(args => $`cometbft ${args}`)
    );

const setDirNames = (config: SwarmConfig) =>
    from([...config.validators, ...config.nodes]).pipe(
        mergeMap((n, idx) => fs.rename(getBaseDir(`node${idx}`), getBaseDir(n.name)))
    )

const getBaseDir = (subdir: string = '') => `${homedir()}/.tvs-test/${subdir}`


