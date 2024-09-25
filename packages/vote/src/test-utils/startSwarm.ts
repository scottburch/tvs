import {getDir} from "@tvs/blockchain";
import {delay, first, from, map, merge, Observable, of, skipUntil, skipWhile, switchMap, tap, timer} from "rxjs";
import {$} from 'zx'
import type {ProcessPromise} from 'zx'


export const startVoteSwarm = () => new Observable(sub => {
    let proc: ProcessPromise;
    const thisDir = getDir(import.meta.url);

    of(getDir(import.meta.url)).pipe(
        switchMap(() => $`docker ps -a |  cut -d ' ' -f1 |grep -v CONTAINER | xargs docker stop`.catch(() => {})),
        switchMap(() => $`docker ps -a |  cut -d ' ' -f1 |grep -v CONTAINER | xargs docker rm`.catch(() => {})),
        map(() => $`docker compose -f ${thisDir}/../../../../docker/compose-testnet.yaml up`),
        tap(p => proc = p),
        switchMap(p => merge(
            from(p.stdout).pipe(
                map(out => out.toString()),
                map(out => `STDOUT: ${out}`)
            ),
            from(p.stderr).pipe(
                map(out => out.toString()),
                map(out => `STDERR: ${out}`)
            ))),
        tap(out => console.log(out)),
        skipWhile(out => !/height=10/.test(out)),
        first(),
        tap(() => sub.next(undefined)),
    ).subscribe();

    return () => {
        console.log('Stopping swarm');
        from(proc.kill()).pipe(
            switchMap(() =>  $`docker ps |  cut -d ' ' -f1 |grep -v CONTAINER | xargs docker kill`),
            delay(1000),
            switchMap(() => $`docker ps -a |  cut -d ' ' -f1 |grep -v CONTAINER | xargs docker rm`)
        ).subscribe()
    }
});
