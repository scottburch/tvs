import {firstValueFrom} from "rxjs";
import {startSwarm} from "./startSwarm.js";

describe('startSwarm', () => {
    it('should start a swarm', () =>
        firstValueFrom(startSwarm({chainId: 'my-chain', nodes: [{name: 'foo'}], validators: [{name: 'bar'}]}))
    )
})