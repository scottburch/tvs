import {finalize, firstValueFrom, map, NEVER, raceWith, tap, timer} from "rxjs";
import {getTomlValue, parseToml, setTomlValue} from "./tomlParser.js";
import {expect} from 'chai'

describe('toml parser', () => {
    it('should parse toml into a JSON structure complete with comments', () =>
        firstValueFrom(parseToml(testToml).pipe(
            tap(toml => {
                expect(toml.lines).to.have.length(29);
                expect(getTomlValue(toml, 'base_boolean')).to.be.false;
                expect(getTomlValue(toml, 'subthing1.subthing1_number')).to.equal(11)
            })
        ))
    );

    it('should be able to set a value in the parsed toml', () =>
        firstValueFrom(parseToml(testToml).pipe(
            map(toml => setTomlValue(toml, 'base_string', 'aaa')),
            tap(toml => {
                expect(getTomlValue(toml, 'base_string')).to.equal('aaa');
                expect(getTomlValue(toml, 'base_boolean')).to.be.false;
            })
        ))
    );

    it('should be able to set a new value in the parsed toml', () =>
        firstValueFrom(parseToml(testToml).pipe(
            map(toml => setTomlValue(toml, 'mine.something', 'bbb')),
            tap(toml => {
                expect(getTomlValue(toml, 'base_string')).to.equal('testing');
                expect(getTomlValue(toml, 'mine.something')).to.equal('bbb')
            })
        ))
    );
});



const testToml = `

base_boolean = false
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
subthing2_string  = "another"


`
