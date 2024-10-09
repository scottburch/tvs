import {startVoteApp} from "../voteApp.js";
import {startSwarm} from "@my-blockchain/blockchain";

export type StartVoteSwarmOpts = {
    numValidators: number,
    numNodes: number
}

export const startVoteSwarm = (opts: StartVoteSwarmOpts = {numValidators: 1, numNodes: 0}) =>
    startSwarm({
        chainId: 'my-chain',
        nodes: Array(opts.numNodes).fill(1).map((_, idx) => ({name: `node-${idx}`})),
        validators: Array(opts.numValidators).fill(1).map((_, idx) => ({name: `val-${idx}`})),
        globalConfigs: {
            'consensus.create_empty_blocks_interval': '10s'
        }
    }, startVoteApp)
