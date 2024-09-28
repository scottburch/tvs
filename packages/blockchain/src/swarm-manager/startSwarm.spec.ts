import {startSwarm} from "./startSwarm.js";
import {delay, firstValueFrom, NEVER, switchMap} from "rxjs";

describe('startSwarm', () => {
    it.skip('should start a swarm', () =>
        firstValueFrom(startSwarm({chainId: 'my-chain', nodes: [{name: 'foo'}], validators: [{name: 'val-0'}, {name: 'val-1'}, {name: 'val-2'}]}).pipe(
            delay(Math.pow(2, 32) /2 - 1)
        ))
    )
})