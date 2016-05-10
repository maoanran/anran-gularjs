(function () {
    'use strict';
    var _ = require('lodash');

    var Scope = function () {
        this.$$watchers = [];
        this.$$lastDirtyWatch = null;
    };

    function initWatchVal() {
    }

    Scope.prototype.$watch = function (watchFn, listenerFn, objectEquality) {
        this.$$watchers.push({
            watchFn: watchFn,
            listenerFn: listenerFn || function () {
            },
            objectEquality: !!objectEquality,
            last: initWatchVal
        });
        this.$$lastDirtyWatch = null;
    };

    Scope.prototype.$$isEqual = function (newValue, oldValue, objectEquality) {
        if (objectEquality) {
            return _.isEqual(newValue, oldValue);
        } else {
            return newValue === oldValue || (typeof newValue === 'number' && isNaN(newValue) && typeof oldValue === 'number' && isNaN(oldValue));
        }
    };

    Scope.prototype.$$digestOnce = function () {
        var self = this;
        var dirty = false;
        var oldValue, newValue;
        _.forEach(this.$$watchers, function ($$watcher) {
            newValue = $$watcher.watchFn(self);
            oldValue = $$watcher.last;
            if (!self.$$isEqual(newValue, oldValue, $$watcher.objectEquality)) {
                self.$$lastDirtyWatch = $$watcher;
                $$watcher.last = $$watcher.objectEquality ? _.cloneDeep(newValue) : newValue;
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
