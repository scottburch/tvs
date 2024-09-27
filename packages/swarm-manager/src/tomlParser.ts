import {combineLatestWith, defaultIfEmpty, filter, from, last, map, merge, mergeMap, mergeScan, of, raceWith, scan, switchMap, tap, toArray} from "rxjs";
import OrderedMap from "orderedmap";

export type ParsedToml = OrderedMap;


export const parseToml = (toml: string) => of(toml).pipe(
    map(() => toml.split('\n')),
    switchMap(lines => from(lines)),
    mergeScan(({prefix}, line, idx) => {
        return merge(
            of(undefined).pipe(
                filter(() => /^[a-zA-Z_[0-9]* =/.test(line)),
                map(() => line.split(' = ')[0].trim()),
                map(key => prefix ? [prefix, key].join('.') : key),
                map(key => ({prefix, key, value: JSON.parse(line.split(' = ')[1])}))
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
        return toml.addToEnd(item.key, item.value)
    }, OrderedMap.from<any>({})),
    last(),
);

export const stringifyToml = (toml: ParsedToml) => from(Object.entries(toml.toObject())).pipe(
    mergeScan((out, [key, value]) => {
        return merge(
            of(it).pipe(
                filter(it => !key.startsWith('#') && !key.startsWith('[')),
                map(() => key.replace(/.*\./, '')),
                map(key => `${out}${out ? '\n' : ''}${key} = ${JSON.stringify(value)}`)
            )
        ).pipe(
            defaultIfEmpty(`${out}${out ? '\n' : ''}${value}`),
        )

    }, ''),
    last()
)






