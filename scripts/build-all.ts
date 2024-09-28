import {$, cd, fs} from 'zx'
import {from, switchMap, tap, concatMap, of, mergeMap, last} from "rxjs";

const root = `${process.cwd()}/../`;

const packages = ['crypto', 'proto', 'blockchain', 'swarm-manager', 'vote', 'react', 'webapp', 'website'];

from(packages).pipe(
    tap(pkg => console.log('Removing "lib" and "dist" directories: ', pkg)),
    mergeMap(pkg => fs.rm(`${root}/packages/${pkg}/lib`, {recursive: true, force: true})),
    mergeMap(pkg => fs.rm(`${root}/packages/${pkg}/dist`, {recursive: true, force: true})),
    last(),
    switchMap(() => from(packages)),
    concatMap(dir => of(dir).pipe(
        tap(dir => console.log('******** BUILDING:', dir)),
        tap(dir => cd(`${root}/packages/${dir}`)),
        switchMap(() => $`yarn build`)
    )),
).subscribe();