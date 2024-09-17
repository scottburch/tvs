import {raceDisplayName} from "./raceDisplayName.js";
import {expect} from "chai";

describe('race display name util', () => {
    it("should convert the race name into something more readable", (done) => {
        expect(raceDisplayName('my-race-name')).to.equal('My Race Name');
        done();
    })
})