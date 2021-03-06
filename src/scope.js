(function () {
    'use strict';
    var _ = require('lodash');

    var Scope = function () {
        this.$$watchers = [];
        this.$$lastDirtyWatch = null;
        this.$$asyncQuene = [];
        this.$$phase = null;
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

    Scope.prototype.$$beginPhase = function (phase) {
        if (this.$$phase) {
            throw this.$$phase + '  already in progress.';
        }
        this.$$phase = phase;
    };

    Scope.prototype.$$clearPhase = function () {
        this.$$phase = null;
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
        this.$$beginPhase('$digest');
        do {
            while (this.$$asyncQuene.length) {
                var asyncTask = this.$$asyncQuene.shift();
                asyncTask.scope.$eval(asyncTask.fn);
            }
            dirty = this.$$digestOnce();
            if ((dirty || this.$$asyncQuene.length) && !(ttl--)) {
                this.$$clearPhase();
                throw "10 digest iterations reached!";
            }
        } while (dirty || this.$$asyncQuene.length);
        this.$$clearPhase();
    };

    Scope.prototype.$eval = function (fn, arg) {
        return fn(this, arg);
    };

    Scope.prototype.$apply = function (fn) {
        try {
            this.$$beginPhase('$apply');
            return this.$eval(fn);
        } finally {
            this.$$clearPhase();
            this.$digest();
        }
    };

    Scope.prototype.$evalAsync = function (fn) {
        var self = this;
        if (!self.$$phase && !self.$$asyncQuene.length) {
            setTimeout(function () {
                if (self.$$asyncQuene.length) {
                    self.$digest();
                }
            }, 0);
        }
        this.$$asyncQuene.push({
            scope: this,
            fn: fn
        });
    };

    module.exports = Scope;
})();
