(function () {
    'use strict';
    var _ = require('lodash');

    var Scope = function () {
        this.$$watchers = [];
    };

    function initWatchVal() {
    }

    Scope.prototype.$watch = function (watchFn, listenerFn) {
        this.$$watchers.push({
            watchFn: watchFn,
            listenerFn: listenerFn || function () {
            },
            last: initWatchVal
        });
    };

    Scope.prototype.$$digestOnce = function () {
        var self = this;
        var dirty = false;
        var oldValue, newValue;
        _.forEach(this.$$watchers, function ($$watcher) {
            newValue = $$watcher.watchFn(self);
            oldValue = $$watcher.last;
            if (oldValue !== newValue) {
                $$watcher.last = newValue;
                $$watcher.listenerFn(newValue, oldValue === initWatchVal ? newValue : oldValue, self);
                dirty = true;
            }
        });
        return dirty;
    };

    Scope.prototype.$digest = function () {
        var ttl = 10;
        var dirty = true;
        while (dirty && ttl-- !== 0) {
            console.log('.....', ttl);
            dirty = this.$$digestOnce();
        }
    };

    module.exports = Scope;
})();
