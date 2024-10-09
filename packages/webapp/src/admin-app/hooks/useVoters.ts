import {useContext, useEffect, useState} from "react";
import {ClientContext} from "@my-blockchain/react";
import {combineLatest, map, of, switchMap, tap} from "rxjs";
import {addVoter, Voter} from "@tvs/vote";
import {encryptPrivKey, generateNewKeyPair, serializeKey} from "@my-blockchain/crypto";
import {readVoters} from "@tvs/vote";

export const useVoters = () => {
    const [client] = useContext(ClientContext);
    const [voters, setVoters] = useState<Voter[]>([]);

    useEffect(() => {
        client.pubKey && readVoters(client).pipe(
                tap(value => setVoters(value))
            ).subscribe();
    }, [client.pubKey]);

    const createVoter = (passwd: string) =>
        of(undefined).pipe(
            switchMap(() => generateNewKeyPair()),
            switchMap(({pubKey, privKey}) => combineLatest([
                serializeKey(pubKey),
                serializeKey(privKey)
            ])),
            switchMap(([pubKey, privKey]) => combineLatest([
                of(pubKey),
                of(privKey),
                addVoter(client, pubKey)
            ])),
            switchMap(([pubKey, privKey]) => combineLatest([
                of(pubKey),
                encryptPrivKey(passwd, privKey)
            ])),
            map(([pubKey, encPrivKey]) => ({pubKey, encPrivKey}))
        );


    return [voters, createVoter] as [Voter[], typeof createVoter];
};