import osme from '../src/index';
import {expect} from 'chai';

describe("geocode", () => {

    const BERLIN = [52.5076678, 13.2857205];
    const MOSCOW = [55.7498582, 37.3516355];
    const AUSTRALIA = [-24.9868075, 115.1814363];

    it('should find Berlin', () =>
        osme.geocode(BERLIN).then(data => {
            expect(data.target.iso[0]).to.be.equal('DE');
            expect(data.names[data.target.l2].name).to.be.equal('Germany');
            expect(data.names[data.target.l2].lng).to.be.equal('en');
        })
    ).timeout(5000);

    it('should find Moscow', () =>
        osme.geocode(MOSCOW).then(data => {
            expect(data.target.iso).to.be.deep.equal(['RU', 'MOS']);
            expect(data.names[data.target.l4].name).to.be.equal('Moscow Oblast');
            expect(data.names[data.target.l2].lng).to.be.equal('en');
        })
    );

    it('should find Moscow in ru', () =>
        osme.geocode(MOSCOW, {
            lang: 'ru'
        }).then(data => {
            expect(data.target.iso).to.be.deep.equal(['RU', 'MOS']);
            expect(data.names[data.target.l2].name).to.be.equal('Россия');
            expect(data.names[data.target.l2].lng).to.be.equal('ru');
        })
    );

    it('should find Australia', () =>
        osme.geocode(AUSTRALIA).then(data => {
            expect(data.target.iso[0]).to.be.equal('AU');
            expect(data.names[data.target.l2].name).to.be.equal('Australia');
            expect(data.names[data.target.l2].lng).to.be.equal('en');
        })
    );
});