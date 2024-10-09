import {useContext, useEffect, useState} from "react";
import {ClientContext} from "@my-blockchain/react";
import {combineLatest, map, of, switchMap, tap, Observable} from "rxjs";
import {addAuditor, Auditor} from "@tvs/vote";
import {ApiClient} from "@my-blockchain/blockchain";
import {readAuditors} from "@tvs/vote";
import {EncryptedPrivKey, encryptPrivKey, generateNewKeyPair, SerializedPubKey, serializeKey} from "@my-blockchain/crypto";


export const useAuditors = () => {
    const [client] = useContext(ClientContext);
    const [auditors, setAuditors] = useState<Auditor[]>([]);

    useEffect(() => {
        client.pubKey && readAuditors(client).pipe(
                tap(value => setAuditors(value))
            ).subscribe();
    }, [client.pubKey]);



    return [auditors, (passwd: string) => createAuditor(client, passwd)] as [Auditor[], (passwd: string) => Observable<{pubKey: SerializedPubKey, encPrivKey: EncryptedPrivKey}>];
};

export const createAuditor = (adminClient: ApiClient, passwd: string) =>
    of(undefined).pipe(
        switchMap(() => generateNewKeyPair()),
        switchMap(({pubKey, privKey}) => combineLatest([
            serializeKey(pubKey),
            serializeKey(privKey)
        ])),
        switchMap(([pubKey, privKey]) => combineLatest([
            of(pubKey),
            of(privKey),
            addAuditor(adminClient, pubKey)
        ])),
        switchMap(([pubKey, privKey]) => combineLatest([
            of(pubKey),
            encryptPrivKey(passwd, privKey)
        ])),
        map(([pubKey, encPrivKey]) => ({pubKey, encPrivKey}))
    );
