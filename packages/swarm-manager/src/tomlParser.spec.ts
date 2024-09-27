import {expand, finalize, firstValueFrom, map, merge, NEVER, of, raceWith, switchMap, take, tap, timer} from "rxjs";
import {expect} from 'chai'
import {parseToml, stringifyToml} from "./tomlParser.js";

describe('toml parser', () => {
    it('should parse toml into a JSON structure complete with comments', () =>
        firstValueFrom(parseToml(testToml).pipe(
            tap(toml => {
                expect(toml.get('base_boolean')).to.be.false
                expect(toml.get('subthing1.subthing1_number')).to.equal(11)
            }),
            switchMap(toml => stringifyToml(toml)),
            tap(str => expect(str).to.equal(testToml))
        ))
    );

    it('should update a value', () =>
        firstValueFrom(parseToml(testToml).pipe(
            map(toml => toml.update('subthing1.subthing1_number', 100)),
            tap(toml => {
                expect(toml.get('subthing1.subthing1_number')).to.equal(100)
            })

        ))
    )
});




const testToml =
`base_boolean = false
base_number = 10
base_string = "testing"


#######################################################################
###                 Some Comment                  ###
#######################################################################

#######################################################
###       RPC Server Configuration Options          ###
#######################################################
[subthing1]

# subthing1 comment
subthing1_boolean = true
subthing1_number = 11
subthing_string = "here I am"

[subthing2]
# subthing2 comment
subthing2_boolean = false
subthing2_number = 12
subthing2_string = "another"


`
