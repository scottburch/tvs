import {expect} from "chai";
import {add, get, newOrderedMap, size, update} from './OrderedMap.js'
import {catchError, firstValueFrom, map, of, tap} from "rxjs";

describe('ordered map', () => {
    it('should return an empty map', (done) => {
        expect(size(newOrderedMap())).to.equal(0);
        done();
    });

    it('should take values and keep them in order', () =>
        firstValueFrom(of(newOrderedMap()).pipe(
            map(map => add(map, 'one', 10)),
            map(map => add(map, 'two', 'my-string')),
            tap(map => {
                expect(get(map, 'one')).to.equal(10);
                expect(get(map, 'two')).to.equal('my-string');
                expect(get(map, 'fake')).to.be.undefined;
            }),
            tap(map => {
                expect(map.entries).to.deep.equal([{
                        key: "one",
                        value: 10
                    },{
                        key: "two",
                        value: "my-string"
                    }
                ])
            })
        ))
    );

    it('should be able to update a current value', () =>
        firstValueFrom(of(newOrderedMap()).pipe(
            map(map => add(map, 'one', 10)),
            map(map => update(map, 'one', 20)),
            tap(map => {
                expect(get(map, 'one')).to.equal(20)
            })
        ))
    );

    it('should ', () =>
        firstValueFrom(of(newOrderedMap()).pipe(
            map(map => update(map, 'one', 20)),
            catchError(err => of(err)),
            tap(err => expect(err).to.deep.equal({code: 'KEY_NOT_FOUND', key: 'one'}))
        ))
    )
})