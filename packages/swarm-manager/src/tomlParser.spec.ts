import {firstValueFrom, map, tap} from "rxjs";
import {expect} from 'chai'
import {parseToml, tomlGet, tomlSet} from "./tomlParser.js";

describe('toml parser', () => {
    it('should parse toml into a JSON structure complete with comments', () =>
        firstValueFrom(parseToml(testToml).pipe(
            tap(toml => {
                expect(tomlGet(toml, 'base_boolean')).to.be.false;
                expect(tomlGet(toml, 'subthing1.subthing1_number')).to.equal(11);
                expect(tomlGet(toml, 'cors_allowed_methods')).to.deep.equal(["HEAD", "GET", "POST"])
            }),
            // switchMap(toml => stringifyToml(toml)),
            // tap(str => expect(str).to.equal(testToml))
        ))
    );

    it('should update a value', () =>
        firstValueFrom(parseToml(testToml).pipe(
            map(toml => tomlSet(toml, 'subthing1.subthing1_number', 100)),
            tap(toml => {
                expect(tomlGet(toml, 'subthing1.subthing1_number')).to.equal(100)
            })

        ))
    )
});




const testToml =
`base_boolean = false
base_number = 10
base_string = "testing"

cors_allowed_methods = ["HEAD", "GET", "POST", ]

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
