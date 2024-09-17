import {expect} from 'chai'
import {generateNewKey} from "./useKeyGenerator.js";
import {combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {decryptPrivKey} from "@tvs/crypto";

describe('useKeyGenerator()', () => {
    it('should generate a new key with encrypted privKey', () =>
        firstValueFrom(generateNewKey('testing').pipe(
            tap(keys => {
                expect(keys.pubKey).to.have.length(44);
                expect(keys.privKey).to.have.length(44);
                expect(keys.encPrivKey).to.have.length(64);
            }),
            switchMap(keys => combineLatest([
                of(keys),
                decryptPrivKey('testing', keys.encPrivKey)
            ])),
            tap(([keys, privKey]) => {
                expect(keys.privKey).to.equal(privKey)
            })
        ))
    );
});