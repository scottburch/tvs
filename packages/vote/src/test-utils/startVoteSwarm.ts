import {startVoteApp} from "../voteApp.js";
import {startSwarm} from "@tvs/blockchain";

export type StartVoteSwarmOpts = {
    numValidators: number,
    numNodes: number
}

export const startVoteSwarm = (opts: StartVoteSwarmOpts = {numValidators: 1, numNodes: 0}) =>
    startSwarm({
        chainId: 'my-chain',
        nodes: [],
        validators: Array(opts.numValidators).fill(1).map((_, idx) => ({name: `val-${idx}`}))
    }, startVoteApp)
