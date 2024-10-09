import {useEffect, useState} from "react";
import {useClient} from "@my-blockchain/react";
import {catchError, interval, of, switchMap, tap, throwError} from "rxjs";
import {Admin, readAdmin} from "@tvs/vote";

export const useReadAdmin = () => {
    const [client] = useClient();
    const [admin, setAdmin] = useState<Admin | undefined>(undefined);

    useEffect(() => {
        const doRead = () => client ? (
            readAdmin(client).pipe(
                tap(({value}) => setAdmin(value)),
                catchError(err => err.log === 'ADMIN_NOT_FOUND' ? of(err) : throwError(err))
            )
        ) : of(undefined);

        const sub = of(undefined).pipe(
            switchMap(() => doRead()),
            switchMap(() => interval(2000)),
            switchMap(() => doRead())
        ).subscribe();


        return () => sub.unsubscribe();
    }, [client]);

    return admin

};