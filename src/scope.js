(function () {
    'use strict';
    var _ = require('lodash');

    var Scope = function () {
        this.$$watchers = [];
        this.$$lastDirtyWatch = null;
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
        this.$$lastDirtyWatch = null;
    };

    Scope.prototype.$$digestOnce = function () {
        var self = this;
        var dirty = false;
        var oldValue, newValue;
        _.forEach(this.$$watchers, function ($$watcher) {
            newValue = $$watcher.watchFn(self);
            oldValue = $$watcher.last;
            if (oldValue !== newValue) {
                self.$$lastDirtyWatch = $$watcher;
                $$watcher.last = newValue;
                $$watcher.listenerFn(newValue, oldValue === initWatchVal ? newValue : oldValue, self);
                dirty = true;
            } else if (self.$$lastDirtyWatch === $$watcher) {
                return false;
            }
        });
        return dirty;
    };

    Scope.prototype.$digest = function () {
        var ttl = 10;
        var dirty = true;
        this.$$lastDirtyWatch = null;
        do {
            if (dirty && !(ttl--)) {
                throw "10 digest iterations reached!";
            }
            dirty = this.$$digestOnce();
        } while (dirty);
    };

    module.exports = Scope;
})();
