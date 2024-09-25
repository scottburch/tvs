import {catchError, combineLatest, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {newApiClient, startCleanValidator, waitForCometDown} from "@tvs/blockchain";
import {addRace, startVoteApp, startVoteSwarm} from "@tvs/vote";
import {singleVoterSetup} from "./helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {doLogin} from "./helpers/loginHelper.js";
import {expect} from "chai";
import {doVote} from "./helpers/voteHelper.js";
import {omit} from 'lodash-es'
import {EncryptedPrivKey, SerializedPrivKey} from "@tvs/crypto";

describe('voting', () => {
    it('can vote', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => singleVoterSetup()),
            switchMap(({privKey, client, adminClient}) => combineLatest([
                of(client),
                of(privKey),
                openBrowser({url: 'http://localhost:1515/vote'}),
                of(adminClient)
            ])),
            switchMap(([client, privKey, page, adminClient]) => of(undefined).pipe(
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => doLogin(page, privKey)),
                switchMap(() => page.click('button:text("vote")')),
                switchMap(() => doVote(client, page, 'Todd')),
                tap(votes => {
                    expect(omit(votes[0], ['time'])).to.deep.equal({
                            candidate: "Todd",
                            flags: {},
                            log: [],
                            race: "dog-catcher",
                            voter: client.pubKey
                    });
                    expect(new Date(votes[0].time).getTime()).to.be.within(Date.now() - 2000, Date.now());
                }),
                switchMap(() => page.locator('button:text("sending vote")').waitFor()),
                switchMap(() => page.locator('button:text("previously voted for todd")').waitFor())
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))
    });

    it('should allow a swarm vote to check votes on other nodes', () =>
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([
                newApiClient({privKey: 'V714fS1VCv5pLc+2TJFipxftW/Cd5UhAdmwxPxzHXi8=' as SerializedPrivKey, url: 'http://localhost:1234'}),
                openBrowser({url: 'http://localhost:1515/vote'}).pipe(
                    tap(() => console.log('***', 'browser open'))
                ),
            ])),
            switchMap(([client, page]) => of(undefined).pipe(
                switchMap(() => doLogin(page, 'Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt' as EncryptedPrivKey)),
                switchMap(() => page.click('button:text("vote")')),
                switchMap(() => doVote(client, page, 'Todd')),
                tap(votes => {
                    expect(omit(votes[0], ['time'])).to.deep.equal({
                        candidate: "Todd",
                        flags: {},
                        log: [],
                        race: "dog-catcher",
                        voter: client.pubKey
                    });
                    expect(new Date(votes[0].time).getTime()).to.be.within(Date.now() - 4000, Date.now());
                }),
                switchMap(() => page.locator('button:text("sending vote")').waitFor()),
                switchMap(() => page.locator('button:text("previously voted for todd")').waitFor()),
                delay(2000)
            )),
        ))
    );
});