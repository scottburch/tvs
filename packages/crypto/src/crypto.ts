import {combineLatest, from, map, of, switchMap, tap} from "rxjs";
import {bech32} from 'bech32'
import * as ed from '@noble/ed25519';

import Base64 from 'base64-js'
import {base64ToUint8Array, stringToUint8Array, uint8ArrayToBase64} from "uint8array-extras";
export const subtle = crypto.subtle;


export type SerializedPubKey = string & { type: 'serializedPubKey' }
export type SerializedPrivKey = string & {type: 'serializedPrivKey'}
export type EncryptedPrivKey = string & {type: 'encryptedPrivKey'}
export type PubKey = Uint8Array & { type: 'pubKey' }
export type PrivKey = Uint8Array & { type: 'privKey' }
export type Signature = Uint8Array & {type: 'signature'}
export type SerializedSig = string & {type: 'serializedSig'}

export type WithSignature<T> = T & {
    sig: string
    signer: SerializedPubKey
}

export type KeyPair = {
    pubKey: PubKey
    privKey: PrivKey
};


export const generateNewKeyPair = () =>
    combineLatest([
        of(ed.utils.randomPrivateKey()).pipe(
            switchMap(privateKey => getPubKeyFromPrivKey(privateKey as PrivKey).pipe(
                map(publicKey => ({privateKey: privateKey as PrivKey, publicKey: publicKey as PubKey})))
            ))
    ]).pipe(
        map(([signKey]) => ({
            pubKey: signKey.publicKey as PubKey,
            privKey: signKey.privateKey as PrivKey
        } satisfies KeyPair as KeyPair)),
    );

export const keyPairFromSerializedPrivKey = (serPrivKey: SerializedPrivKey) =>
    deserializeKey(serPrivKey).pipe(
        switchMap(privKey => combineLatest([
            of(privKey),
            getPubKeyFromPrivKey(privKey)
        ])),
        map(([privKey, pubKey]) => ({privKey, pubKey: pubKey as PubKey} satisfies KeyPair))
    );

export const getPubKeyFromPrivKey = (privKey: PrivKey) => from(ed.getPublicKeyAsync(privKey))

export const verify = (data: Uint8Array, sig: Uint8Array, pubKey: PubKey) =>
    from(subtle.digest('sha-1', data)).pipe(
        switchMap(hash => ed.verifyAsync(sig, new Uint8Array(hash), pubKey))
    );


export const serializeSig = (sig: Signature) =>
    of(sig).pipe(
        map(sig => Base64.fromByteArray(sig) as SerializedSig),
    );

export const deserializeSig = (str: SerializedSig) =>
    of(str).pipe(
        map(str => Base64.toByteArray(str) as Signature)
    )


export const deserializeKey = <T extends SerializedPubKey | SerializedPrivKey>(key: T) =>
    of(key).pipe(
        map(key => Base64.toByteArray(key) as T extends SerializedPubKey ? PubKey : PrivKey)
    );

export const serializeKey = <T extends PubKey | PrivKey>(key: T) =>
    of(key).pipe(
        map(key => Base64.fromByteArray(key) as T extends PubKey ? SerializedPubKey : SerializedPrivKey)
    )

export const getId = (pubKey: Uint8Array) =>
    of(pubKey).pipe(
        map(pubKeyRaw => pubKeyRaw.slice(0, 32)),
        map(pubKeySlice => bech32.toWords(pubKeySlice)),
        map(words => bech32.encode('eg', words)),
    );

export const sign = (data: Uint8Array, privKey: PrivKey) =>
    from(subtle.digest('sha-1', data)).pipe(
        switchMap(hash => ed.signAsync(new Uint8Array(hash), privKey)),
        map(sig => sig as Signature)
    )

const SALT = new Uint8Array(16).fill(1);

const passwdToKey = (passwd: string, salt: Uint8Array) =>
    of(passwd).pipe(
        map(passwd => stringToUint8Array(passwd)),
        switchMap(passwd => subtle.importKey('raw', passwd, 'PBKDF2', false, ['deriveBits'])),
        map(importedKey => ({
            importedKey,
            params: {
                name: "PBKDF2",
                hash: 'SHA-256',
                salt,
                iterations: 65000
            } as Pbkdf2Params
        })),
        switchMap(({importedKey, params}) => subtle.deriveBits(params, importedKey, 128 * 8)),
        switchMap(keyBits => subtle.importKey('raw', keyBits.slice(0, 32), {name: 'AES-CBC'}, false, ['encrypt', 'decrypt'])),
    );

export const encryptPrivKey = (password: string, privKey: SerializedPrivKey) =>
    passwdToKey(password, SALT).pipe(
        switchMap(passKey => subtle.encrypt({name: 'AES-CBC', iv: SALT}, passKey, base64ToUint8Array(privKey))),
        map(privKey => uint8ArrayToBase64(new Uint8Array(privKey))),
        map(privKey => privKey as EncryptedPrivKey)

);

export const decryptPrivKey = (password: string, encPrivKey: string) =>
    passwdToKey(password, SALT).pipe(
        switchMap(passKey => subtle.decrypt({name: 'AES-CBC', iv: SALT}, passKey, base64ToUint8Array(encPrivKey))),
        map(privKey => uint8ArrayToBase64(new Uint8Array(privKey))),
        map(privKey => privKey as SerializedPrivKey)
    )



