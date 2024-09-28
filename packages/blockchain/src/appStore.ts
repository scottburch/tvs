//@ts-ignore
import memlevel from 'level-mem'
import {Level} from 'level'
import {
    catchError,
    combineLatest, count, defaultIfEmpty, firstValueFrom,
    from,
    last,
    map, merge,
    mergeMap, of, scan, switchMap, tap,
    throwError,
    toArray
} from "rxjs";
import {hash as cryptoHash} from 'node:crypto'

export type AppStore = {
    mem: Level
    disk: Level
}


export const newAppStore = (dir: string) => {
    const disk = new Level(dir);
    return from(disk.open()).pipe(
        map(() => ({
            mem: memlevel(),
                disk
        } satisfies AppStore as AppStore))
    )
};

export const newTempStore = (store: AppStore) => ({
    mem: memlevel(),
    disk: store.disk
});


export const put = (store: AppStore, key: string, value: string) =>
    from(store.mem.put(key, value)).pipe(
        map(() => store)
    );

export const get = (store: AppStore, key: string) =>
    from(store.mem.get(key)).pipe(
        catchError(err => err.name === 'NotFoundError' ? store.disk.get(key) : throwError(() => err)),
        catchError(err => err.notFound ? throwError(() => ({code: 'NOT_FOUND'})) : throwError(() => err))
    );

export const close = (store: AppStore) =>
    combineLatest([
        store.mem.close(),
        store.disk.close()
    ]);

export const commit = (store: AppStore) =>
    from(store.mem.iterator()).pipe(
        mergeMap(([key, val]) => combineLatest([
            store.disk.put(key, val),
            store.mem.del(key)
        ])),
        defaultIfEmpty(store),
        last(),
        map(() => store)
    );

export const hash = (store: AppStore) =>
    from(store.mem.iterator()).pipe(
        toArray(),
        map(data => data.toString()),
        map(data => cryptoHash('SHA256', data, 'hex')),
    );

export const exists = (store: AppStore, key: string) =>
    from(get(store, key)).pipe(
        map(() => true),
        catchError(() => of(false))
    );

export const findPrefix = (store: AppStore, prefix: string) =>
    merge(
        from(store.mem.iterator({gte: prefix, lte: prefix + String.fromCharCode(0xff)})),
        from(store.disk.iterator({gte: prefix, lte: prefix + String.fromCharCode(0xff)}))
    );

export const clearMemStore = (store: AppStore) => from(store.mem.iterator()).pipe(
    tap(() => '*** clear mem store'),
    mergeMap(([key]) => store.mem.del(key)),
    count()
);

