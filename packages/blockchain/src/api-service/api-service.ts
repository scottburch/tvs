import {App, AppConfig} from "../app.js";
import express, {Express} from 'express'
import {catchError, defaultIfEmpty, delay, firstValueFrom, last, map, Observable, of, switchMap, tap} from "rxjs";
import {broadcastTx, query, txByHash, TvsClient, tvsClient, waitForTx} from "../rpc-client.js";
import {Server} from "node:net";
import cors from 'cors'

export const startApiService = (app: App) => new Observable(sub => {
    const exp = express();
    exp.use(express.json());
    exp.use(cors({
        allowedHeaders: '*',
        origin: '*'
    }))

    const client = tvsClient();
    let server: Server;

    const s = of(undefined).pipe(
        switchMap(() => addTxHandler(app.config, exp, client)),
        switchMap(() => addQueryHandler(app.config, exp, client)),
        switchMap(() => addTxByHashHandler(app.config, exp, client)),
        switchMap(() => addWaitForTxHandler(app.config, exp, client)),
        map(() => exp.listen(app.config.apiPort || 1234)),
        map(s => server = s),
        delay(500),
        tap(() => sub.next(undefined))
    ).subscribe();

    return () => {
        s.unsubscribe()
        server.close()
    };
});


const addTxHandler = (appConfig: AppConfig, exp: Express, client: TvsClient) =>
    of(undefined).pipe(
        tap(() => exp.options('/tx', (req, resp) => {
            resp.send('');
        })),
        tap(() => exp.post('/tx', (req, resp) => {
            firstValueFrom(broadcastTx(client, req.body).pipe(map(r => resp.send(JSON.stringify(r)))).pipe(
                catchError(err => of(resp.send(JSON.stringify(err))))
            ))
        })),
        defaultIfEmpty(undefined),
        last()
    );

const addQueryHandler = (appConfig: AppConfig, exp: Express, client: TvsClient) =>
    of(undefined).pipe(
        tap(() => exp.options('/query', (req, resp) => {
            resp.send('');
        })),
        tap(() => exp.post('/query', (req, resp) => {
            firstValueFrom(query(client, req.body).pipe(map(r => resp.send(JSON.stringify(r)))))
        })),
        defaultIfEmpty(undefined),
        last()
    );

const addTxByHashHandler = (appConfig: AppConfig, exp: Express, client: TvsClient) =>
    of(undefined).pipe(
        tap(() => exp.options('/tx-by-hash', (req, resp) => {
            resp.header({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type'});
            resp.send('');
        })),
        tap(() => exp.post('/tx-by-hash', (req, resp) => {
            resp.header({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type'});
            firstValueFrom(txByHash(client, req.body.hash).pipe(map(r => resp.send(JSON.stringify(r)))))
        }))
    );

const addWaitForTxHandler = (appConfig: AppConfig, exp: Express, client: TvsClient) =>
    of(undefined).pipe(
        tap(() => exp.options('/wait-for-tx', (_, resp) => {
            resp.header({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type'});
            resp.send('');
        })),
        tap(() => exp.post('/wait-for-tx', (req, resp) => {
            resp.header({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type'});
            firstValueFrom(waitForTx(client, req.body.hash).pipe(map(r => resp.send(JSON.stringify(r)))))
        }))
    );



