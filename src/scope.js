(function () {
    'use strict';
    var _ = require('lodash');

    var scope = function () {
        this.$$watchers = [];
    };

    scope.prototype.$watch = function (watchFn, listenerFn) {
        this.$$watchers.push({
            watchFn: watchFn,
            listenerFn: listenerFn
        });
    };

    scope.prototype.$digest = function () {
        var self = this;
        var oldValue, newValue;
        _.forEach(this.$$watchers, function ($$watcher) {
            newValue = $$watcher.watchFn(self);
            oldValue = $$watcher.last;
            if (oldValue !== newValue) {
                $$watcher.last = newValue;
                $$watcher.listenerFn(newValue, oldValue, self);
            }
        });
    };

    module.exports = scope;
})();
