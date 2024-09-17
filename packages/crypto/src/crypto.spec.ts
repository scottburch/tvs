import {
    decryptPrivKey,
    deserializeKey,
    deserializeSig, encryptPrivKey,
    generateNewKeyPair,
    getId, keyPairFromSerializedPrivKey,
    serializeKey,
    serializeSig,
    sign,
    verify
} from "./crypto.js";
import {combineLatest, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {expect} from 'chai';


describe('crypto', function () {

        describe('serializing keys', () => {

            it('should generate a public key from a serialized private key', () =>
                firstValueFrom(generateNewKeyPair().pipe(
                    switchMap(origKeys => of(undefined).pipe(
                        switchMap(() => serializeKey(origKeys.privKey)),
                        switchMap(serPrivKey => keyPairFromSerializedPrivKey(serPrivKey)),
                        tap(keys => {
                            expect(keys.privKey).to.deep.equal(origKeys.privKey)
                        }),
                        switchMap(keys => combineLatest([
                            of(keys),
                            sign(new Uint8Array([1,2,3]), keys.privKey)
                        ])),
                        switchMap(([keys, sig]) => verify(new Uint8Array([1,2,3]), sig, keys.pubKey)),
                        map(valid => expect(valid).to.be.true)
                    ))
                ))
            );

            it('should be able to serialize/deserialize a public key', () =>
                firstValueFrom(generateNewKeyPair().pipe(
                    switchMap(keys => sign(new TextEncoder().encode('testing'), keys.privKey).pipe(map(sig => ({sig, keys})))),
                    switchMap(({sig, keys}) => serializeKey(keys.pubKey).pipe(map(pubKey => ({sig, keys, pubKey})))),
                    switchMap(({sig, pubKey}) => deserializeKey(pubKey).pipe(map(pubKey => ({sig, pubKey})))),
                    switchMap(({sig, pubKey}) => verify(new TextEncoder().encode('testing'), sig, pubKey)),
                    tap(result => expect(result).to.be.true)
                ))
            )
        });


        describe('signing data', () => {
            it('should sign data that can be verified', () =>
                firstValueFrom(of(new TextEncoder().encode(JSON.stringify({foo: 1, bar: 2}))).pipe(
                    switchMap(data => combineLatest([
                        of(data),
                        generateNewKeyPair(),
                    ])),
                    switchMap(([data, keys]) => combineLatest([
                        of(keys),
                        of(data),
                        sign(data, keys.privKey)
                    ])),
                    switchMap(([keys, data, sig]) =>
                        verify(data, sig, keys.pubKey)
                    ),
                    tap(valid => expect(valid).to.be.true)
                ))
            );

            it('should fail to verify on a bad signature', () =>
                firstValueFrom(of(new TextEncoder().encode(JSON.stringify({foo: 1, bar: 2}))).pipe(
                    switchMap(data => combineLatest([
                        of(data),
                        generateNewKeyPair(),
                    ])),
                    switchMap(([data, keys]) => combineLatest([
                        of(keys),
                        of(data),
                        sign(data, keys.privKey)
                    ])),
                    switchMap(([keys, data, sig]) =>
                        verify(data, sig.reverse(), keys.pubKey)
                    ),
                    tap(valid => expect(valid).to.be.false)
                ))

            )
        });

        describe('serialize/deserializeSignature()', () => {
            it('should serialize/deserialize a signature', () =>
                firstValueFrom(generateNewKeyPair().pipe(
                    switchMap(keys => sign(new TextEncoder().encode('testing'), keys.privKey)),
                    switchMap(sig => serializeSig(sig).pipe(
                        switchMap(str => deserializeSig(str)),
                        map(newSig => ({sig, newSig}))
                    )),
                    tap(({sig, newSig}) => expect(sig).to.deep.equal(newSig))
                ))
            )
        })

        describe('getId()', () => {
            it('should return an id for a pubkey', () =>
                firstValueFrom(generateNewKeyPair().pipe(
                    switchMap(({pubKey}) => getId(pubKey)),
                    tap(id => {
                        expect(id).to.match(/^eg/);
                        expect(id).to.have.length(61);
                    })
                ))
            )
        });

        it('should encrypt a serialized priv key', () =>
            firstValueFrom(generateNewKeyPair().pipe(
                switchMap(({privKey}) => serializeKey(privKey)),
                switchMap(privKey => of(undefined).pipe(
                    switchMap(() => encryptPrivKey('password', privKey)),
                    switchMap(encPrivKey => decryptPrivKey('password', encPrivKey)),
                    tap(decryptPrivKey => expect(privKey).to.equal(decryptPrivKey))
                ))
            ))
        )
});

