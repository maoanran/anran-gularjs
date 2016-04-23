var _ = require('lodash');

module.exports = function (to) {
    return _.template('hello <%= name %>')({name : to});
};
