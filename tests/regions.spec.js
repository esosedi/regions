import osme from '../src/index';
import {expect} from 'chai';

describe("Regions", () => {
    describe("fetching", () => {
        it('should call load callback', (done) => {
            osme.geoJSON("AU-NT", {}, (data) => {
                expect(data.metaData.name).to.be.equal('AU-NT');
                done();
            });
        });

        it('should call load callback', (done) => {
            osme.geoJSON("AU-NT", {quality: -1}, (data) => {
                expect(data.metaData.name).to.be.equal('AU-NT');
                done();
            });
        });

        it('should return a promise', () => {
            return osme.geoJSON("AU-NT").then(data => {
                expect(data.metaData.name).to.be.equal('AU-NT');
                return true;
            }).catch(() => {
                expect("must not be called").to.equal(true)
            });
        });
    });

    describe("error fetch", () => {
        it('should call error callback', (done) => {
            osme.geoJSON("world", {
                host: "unexistsing-in-a-world-host.test"
            }, ()=> {
                expect("must not be called").to.equal(true);
                done();
            }, ()=> {
                done();
            }).catch(()=>{});
        });

        it('should return a promise', () => {
            return osme.geoJSON("undefined-keywork").then(() => {
                expect("must not be called").to.equal(true);
            }, () => {
                return true;
            });
        });
    });
});