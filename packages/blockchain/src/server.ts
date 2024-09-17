import {map, Observable, of, Subject, switchMap, tap} from "rxjs";
import * as net from "node:net";
import varint from 'varint'

export type ProcessorFactory = () => {sub: Subject<Uint8Array>, resp: Observable<Uint8Array>};

export type ServerConfig = {
    processorFactory: ProcessorFactory,
    port: number
}

export const startServer = ({processorFactory, ...config}: ServerConfig) => new Observable(sub => {
    console.log('starting app acbi server');

    const server = net.createServer((socket) => {
        const processor = processorFactory();

        const s = processor.resp.pipe(
            switchMap(data => prependLengthToData(data)),
            tap(buf => socket.write(buf))
        ).subscribe();

        let buf = new Uint8Array();
        socket.on('data', (d) => {
            buf = Buffer.concat([buf, d]);
            const {msgs, buf: newBuf} = getMsgsFromBuf(buf)
            buf = newBuf;

            msgs.map(msg => processor.sub.next(msg));
        });

        socket.on('close', () => {
            s.unsubscribe();
            console.log('closing');
            processor.sub.complete();
            sub.complete();
        });
    });

    server.listen(config.port, () => sub.next(undefined));

    return () => {
        console.log('stopping app server');
        server.close();
    };
});

const prependLengthToData = (data: Uint8Array) =>
    of(data).pipe(
        map(data => [new Uint8Array(varint.encode(data.length)), data]),
        map(parts => Buffer.concat(parts)),
    )

const getMsgsFromBuf = (buf: Uint8Array, msgs: Uint8Array[] = []): { msgs: Uint8Array[], buf: Uint8Array } => {
    const length = varint.decode(buf);
    const start = varint.decode.bytes || 0;

    if (buf.length >= length + start) {
        msgs = [...msgs, buf.slice(start, length + start)]
        buf = buf.slice(start + length)
    } else {
        return {msgs, buf}
    }

    if (buf.length > 0) {
        return getMsgsFromBuf(buf, msgs);
    } else {
        return {msgs, buf}
    }
};