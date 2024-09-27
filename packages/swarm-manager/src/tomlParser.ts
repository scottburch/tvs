import {defaultIfEmpty, filter, from, last, map, merge, mergeMap, mergeScan, of, raceWith, scan, switchMap, tap} from "rxjs";

export type ParsedToml = {
    lines: string[],
    values: Record<string, { val: any, ln: number }>
}


export const parseToml = (toml: string) => of(toml).pipe(
    map(() => toml.split('\n')),
    switchMap((lines) => from(lines).pipe(
            map(line => line.trim()),
            mergeScan((result, line, idx) => {
                    return merge(
                        of(undefined).pipe(
                            filter(() => /^[a-zA-Z0-9_\s]*=/.test(line)),
                            map(() => result.prefix ? [result.prefix, line.split(' = ')[0]].join('.') : line.split(' = ')[0]),
                            map(key => ({
                                ...{lines, prefix: result.prefix},
                                values: {...result.values, [key]: {val: JSON.parse(line.split(' = ')[1]), ln: idx}}
                            } satisfies ParsedToml & { prefix: string }))
                        ),
                        of(undefined).pipe(
                            filter(() => /^\[.*]$/.test(line)),
                            map(() => line.replace(/\[(.*)]/, '$1')),
                            map(prefix => ({lines, values: result.values, prefix} satisfies ParsedToml & { prefix: string }))
                        )
                    ).pipe(
                        defaultIfEmpty({lines, values: result.values, prefix: result.prefix} satisfies  ParsedToml & { prefix: string })
                    )
                }, {lines, values: {}, prefix: ''} as ParsedToml & { prefix: string },
            ),
            last(),
            map(({lines, values}) => ({lines, values})),
        ),
    )
);

export const getTomlValue = (toml: ParsedToml, key: string) =>
    toml.values[key].val;

export const setTomlValue = (toml: ParsedToml, key: string, value: any) => {
    toml.values[key] = toml.values[key] || {};
    toml.values[key].val = value;
    return toml
};



