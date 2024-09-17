import {encryptPrivKey, generateNewKeyPair, serializeKey} from "@tvs/crypto";
import {combineLatest, map, of, switchMap} from "rxjs";


export const generateNewKey = (passwd: string) => generateNewKeyPair().pipe(
    switchMap(keys => combineLatest([
        serializeKey(keys.pubKey),
        serializeKey(keys.privKey)
    ])),
    switchMap(([pubKey, privKey]) => combineLatest([
        of(pubKey),
        of(privKey),
        encryptPrivKey(passwd, privKey)
    ])),
    map(([pubKey, privKey, encPrivKey]) => ({
        pubKey,
        privKey,
        encPrivKey
    }))
);

export const useKeyGenerator = () => generateNewKey;