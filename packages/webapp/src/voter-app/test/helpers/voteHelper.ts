import {Page} from 'playwright'
import {from, interval, skipWhile, switchMap, first} from "rxjs";
import {readVotesByVoter} from "@tvs/vote";
import {ApiClient} from "@my-blockchain/blockchain";

export const doVote = (client: ApiClient, page: Page, value: string) =>
    from(page.click(`input[value=${value}]`)).pipe(
        switchMap(() => page.click('button:text("Register Vote")')),
        switchMap(() => interval(500)),
        switchMap(() => readVotesByVoter(client, client.pubKey)),
        skipWhile(votes => votes.length === 0),
        first()
    );
