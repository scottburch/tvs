import {startSwarm} from "./startSwarm.js";
import {delay, firstValueFrom, NEVER, switchMap} from "rxjs";

describe('startSwarm', () => {
    it('should start a swarm', () =>
        firstValueFrom(startSwarm({chainId: 'my-chain', nodes: [{name: 'foo'}], validators: [{name: 'bar'}]}).pipe(
            delay(3000)
        ))
    )
})