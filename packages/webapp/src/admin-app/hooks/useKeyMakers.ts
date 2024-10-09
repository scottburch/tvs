import {useContext, useEffect, useState} from "react";
import {ClientContext} from "@my-blockchain/react";
import {combineLatest, map, of, switchMap, tap, Observable} from "rxjs";
import {addKeyMaker, KeyMaker} from "@tvs/vote";
import {ApiClient} from "@my-blockchain/blockchain";
import {readKeyMakers} from "@tvs/vote";
import {EncryptedPrivKey, encryptPrivKey, generateNewKeyPair, SerializedPubKey, serializeKey} from "@my-blockchain/crypto";


export const useKeyMakers = () => {
    const [client] = useContext(ClientContext);
    const [keyMakers, setKeyMakers] = useState<KeyMaker[]>([]);

    useEffect(() => {
            client.pubKey && readKeyMakers(client).pipe(
                tap(value => setKeyMakers(value))
            ).subscribe();
    }, [client.pubKey]);



    return [keyMakers, (passwd: string) => createKeyMaker(client, passwd)] as [KeyMaker[], (passwd: string) => Observable<{pubKey: SerializedPubKey, encPrivKey: EncryptedPrivKey}>];
};

export const createKeyMaker = (adminClient: ApiClient, passwd: string) =>
    of(undefined).pipe(
        switchMap(() => generateNewKeyPair()),
        switchMap(({pubKey, privKey}) => combineLatest([
            serializeKey(pubKey),
            serializeKey(privKey)
        ])),
        switchMap(([pubKey, privKey]) => combineLatest([
            of(pubKey),
            of(privKey),
            addKeyMaker(adminClient, pubKey)
        ])),
        switchMap(([pubKey, privKey]) => combineLatest([
            of(pubKey),
            encryptPrivKey(passwd, privKey)
        ])),
        map(([pubKey, encPrivKey]) => ({pubKey, encPrivKey}))
    );
