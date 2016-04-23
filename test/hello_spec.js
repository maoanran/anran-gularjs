var hello = require('../src/hello');

describe('hello', function(){
    it('say hello', function() {
        expect(hello('anran')).toBe('hello anran');
    });
});
