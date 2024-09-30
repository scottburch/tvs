import {SerializedPubKey} from "@tvs/crypto";
import {readVote} from "@tvs/vote";
import {switchMap} from "rxjs";
import {newRandomApiClient} from "@tvs/blockchain";

export const useCheckVote = () =>
    (url: string, race: string, voter: SerializedPubKey) => newRandomApiClient(url).pipe(
        switchMap(client => readVote(client, race, voter)),
    )
