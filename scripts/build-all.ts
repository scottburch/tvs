import {$, cd} from 'zx'
import {from, switchMap, tap, concatMap, of} from "rxjs";

const root = `${process.cwd()}/../`;

from(['crypto', 'proto', 'blockchain', 'vote', 'react', 'webapp', 'website']).pipe(
    concatMap(dir => of(dir).pipe(
        tap(dir => console.log('******** BUILDING:', dir)),
        tap(dir => cd(`${root}/packages/${dir}`)),
        switchMap(() => $`yarn build`)
    )),
).subscribe();