import {defaultIfEmpty, filter, from, last, map, merge, mergeScan, of, scan, switchMap} from "rxjs";
import {newOrderedMap, add, get, OrderedMap, exists, update} from "./OrderedMap.js";


export type ParsedToml = OrderedMap;


export const parseToml = (toml: string) => of(toml).pipe(
    map(() => toml.split('\n')),
    switchMap(lines => from(lines)),
    mergeScan(({prefix}, line, idx) => {
        return merge(
            of(undefined).pipe(
                filter(() => /^[a-zA-Z_[0-9]* =/.test(line)),
                map(() => line.split(' = ')),
                map(([key, value]) => ([key.trim(), value.trim()])),
                map(([key, value]) => ([key, value.replace(/(.*), ]/, '$1]')])),
                map(([key, value]) => ([prefix ? [prefix, key].join('.') : key, value])),
                map(([key, value]) => ({prefix, key, value: JSON.parse(value)}))
            ),
            of(undefined).pipe(
                filter(() => /^\[.*]$/.test(line)),
                map(() => line.replace(/^\[(.*)]/, '$1')),
                map(prefix => ({prefix, key: line, value: line}))
            )
        ).pipe(
            defaultIfEmpty({prefix, key: `#${idx}`, value: line})
        )
    }, {prefix: ''} as { prefix: string, key: string, value: any }),
    scan((toml, item) => {
        return add(toml, item.key, item.value)
    }, newOrderedMap()),
    last(),
);

export const stringifyToml = (toml: ParsedToml) => from(toml.entries).pipe(
    mergeScan((out, {key, value}) => {
        return merge(
            of(undefined).pipe(
                filter(() => !key.startsWith('#') && !key.startsWith('[')),
                map(() => key.replace(/.*\./, '')),
                map(key => `${out}${out ? '\n' : ''}${key} = ${JSON.stringify(value)}`)
            )
        ).pipe(
            defaultIfEmpty(`${out}${out ? '\n' : ''}${value}`),
        )
    }, ''),
    last()
);

export const tomlSet = (toml: ParsedToml, key: string, value: any) => exists(toml, key) ? update(toml, key, value) : add(toml, key, value);
export const tomlGet = (toml: ParsedToml, key: string) => get(toml, key)






