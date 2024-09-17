import {
    get,
    newAppStore,
    put,
    close,
    commit,
    hash,
    clearMemStore,
    exists,
    findPrefix,
    newTempStore
} from "./appStore.js";
import {expect} from 'chai';
import {catchError, combineLatest, firstValueFrom, from, map, of, switchMap, tap, toArray} from "rxjs";
import {homedir} from "node:os";
import {fs} from 'zx'


const DB_DIR = `${homedir()}/.tvs-test`

describe('application store', () => {
    it('should create a new store', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            tap(store => expect(store).not.to.be.undefined),
            switchMap(store => close(store))
        ))
    );

    it('should throw a NotFoundError if key is not found', (done) => {
        let caught = false;
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => get(store, 'fake')),
                catchError(err => {
                    expect(err.code).to.equal('NOT_FOUND');
                    caught = true
                    return of(undefined)
                }),
                switchMap(() => close(store)),
                tap(() => done(caught ? undefined : 'did not throw proper error'))
            ))
        ))
    });

    it('should store a value only in memory before a commit()', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => put(store, 'foo', 'bar')),
                switchMap(() => get(store, 'foo')),
                tap(value => expect(value).to.equal('bar')),
                switchMap(() => close(store)),
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(store => of(undefined).pipe(
                    switchMap(() => get(store, 'foo')),
                    catchError(err => of(err)),
                    tap(err => expect(err.code).to.equal('NOT_FOUND')),
                    switchMap(() => close(store))
                ))
            ))
        ))
    );

    it('should store a value to disk after a commit()', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => put(store, 'foo', 'bar')),
                switchMap(() => put(store, 'foo1', 'bar1')),
                switchMap(() => put(store, 'foo2', 'bar2')),
                switchMap(() => commit(store)),
                switchMap(() => close(store)),
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(store => combineLatest([
                    get(store, 'foo'),
                    get(store, 'foo1'),
                    get(store, 'foo2')
                ]).pipe(
                    tap(values => expect(values).to.deep.equal(['bar', 'bar1', 'bar2'])),
                    switchMap(() => close(store))
                )),
            ))
        ))
    );

    it('should clear the memstore after a commit()', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => put(store, 'foo', 'bar')),
                switchMap(() => put(store, 'foo1', 'bar1')),
                switchMap(() => put(store, 'foo2', 'bar2')),
                switchMap(() => commit(store)),
                switchMap(() => combineLatest([
                    get(store, 'foo'),
                    get(store, 'foo1'),
                    get(store, 'foo2')
                ])),
                tap(values => expect(values).to.deep.equal(['bar', 'bar1', 'bar2'])),
                switchMap(() => combineLatest([
                    store.mem.get('foo'),
                ])),
                catchError(err => of(err)),
                tap(err => expect(err.name).to.equal('NotFoundError')),
                switchMap(() => close(store))
            ))
        ))
    )

    it('should be able to calculate a hash for the memory store', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => put(store, 'foo', 'bar')),
                switchMap(() => put(store, 'foo1', 'bar1')),
                switchMap(() => put(store, 'foo2', 'bar2')),
                switchMap(() => hash(store)),
                tap(hash => expect(hash).to.equal('5bfc4d8a9a5d7bacf7c7355d35df9414c093e4d7a651fdc2f866076fa4efc9f4')),
                switchMap(() => close(store))
            ))
        ))
    );

    it('should have a way to see if a key exists', () =>
            firstValueFrom(rmDb().pipe(
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(store => of(undefined).pipe(
                    switchMap(() => put(store, 'foo', 'bar')),
                    switchMap(() => combineLatest([
                        exists(store, 'foo'),
                        exists(store, 'baz')
                    ])),
                    tap(results => expect(results).to.deep.equal([true, false])),
                    switchMap(() => close(store))
                ))
            ))

    )

    it('should have a way to clear the memstore only', () =>
        firstValueFrom(rmDb().pipe(
            switchMap(() => newAppStore(DB_DIR)),
            switchMap(store => of(undefined).pipe(
                switchMap(() => put(store, 'foo', 'bar')),
                switchMap(() => commit(store)),
                switchMap(() => put(store, 'foo1', 'bar1')),
                switchMap(() => put(store, 'foo2', 'bar2')),
                switchMap(() => clearMemStore(store)),
                switchMap(() => combineLatest([
                    exists(store, 'foo'),
                    exists(store,' foo1'),
                    exists(store, 'foo2')
                ])),
                tap(result => expect(result).to.deep.equal([true, false, false])),
                switchMap(() => close(store))
            ))
        ))
    );

    describe('searching', () => {
        it('should be able to find keys by a prefix', () =>
            firstValueFrom(rmDb().pipe(
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(store => of(undefined).pipe(
                    switchMap(() => combineLatest([
                        put(store, 'foo1', 'bar1'),
                        put(store, 'foo2', 'bar2'),
                        put(store, 'foo3', 'bar3'),
                        put(store, 'boo1', 'bar1')
                    ])),
                    switchMap(() => findPrefix(store, 'fo')),
                    toArray(),
                    tap(results => expect(results).to.deep.equal([
                        ["foo1", "bar1"],
                        ["foo2", "bar2"],
                        ["foo3", "bar3"]
                    ])),
                    switchMap(() => close(store))
                ))
            ))
        )

    });

    describe('temp store', () => {
        it('should not affect the memstore of the parent store', () =>
            firstValueFrom(rmDb().pipe(
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(parent => of(undefined).pipe(
                    map(() => newTempStore(parent)),
                    switchMap(store => combineLatest([
                        of(store),
                        put(store, 'my-key', 'my-value')
                    ])),
                    switchMap(([store]) => get(store, 'my-key')),
                    tap(val => expect(val).to.equal('my-value')),
                    switchMap(() => get(parent, 'my-key')),
                    catchError(err => of('notThere')),
                    tap(val => expect(val).to.equal('notThere')),
                    switchMap(() => close(parent))
                ))
            ))
        );

        it('should update the diskstore of the parent store on commit', () =>
            firstValueFrom(rmDb().pipe(
                switchMap(() => newAppStore(DB_DIR)),
                switchMap(parent => of(undefined).pipe(
                    map(() => newTempStore(parent)),
                    switchMap(store => put(store, 'my-key', 'my-value')),
                    switchMap(store => commit(store)),
                    switchMap(() => get(parent, 'my-key')),
                    tap(val => expect(val).to.equal('my-value')),
                    switchMap(() => close(parent))
                ))
            ))
        )
    })
});

const rmDb = () => from(fs.promises.rm(DB_DIR, {recursive: true, force: true}));