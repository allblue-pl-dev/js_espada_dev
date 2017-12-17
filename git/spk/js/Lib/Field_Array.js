'use strict';


var Field_Array = Object.create(null, {

    Class: { value:
    function(field) {
        Object.defineProperties(this, {
            _field: { value: field }
        });
    }},

    index: {
    get: function() {
        if (this._field._parent === null)
            return null;

        if (!this._field._parent.isArray()) {
            throw new Error('Field `' + this._field.getName() +
                    '` is not an `Array` item. Use `key` instead.');
        }

        return parseInt(this._field.getName());
    }},

    key: {
    get: function() {
        if (this._field._parent === null)
            return null;

        if (this._field._parent.isArray()) {
            throw new Error('Field `' + this._field.getName() +
                    '` is an `Array` item. Use `index` instead.');
        }

        return this._field.getName();
    }},

    length: {
    get: function() {
        return Object.keys(this).length;
    }},

    onChange: { value:
    function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        this._field.addEventListener_OnChange.apply(this._field, args);

        return this;
    }},

    pop: { value:
    function(i) {
        if (typeof i === 'undefined' || i === this.length - 1)
            this._field.unset(Object.keys(this).pop());
        else {
            /* Can be handled better (with only 1 update). */
            var keys = Object.keys(this);

            var values = {};
            for (var j = i; j < this.length - 1; j++)
                values[j + ''] = this[j + 1 + ''];

            this._field.set(values);
            this.pop();
        }

    }},

    push: { value:
    function() {
        for (var i = 0; i < arguments.length; i++) {
            this._field.set(Object.keys(this).length, arguments[i]);
        }
    }},

    pushArray: { value:
    function(values) {
        for (var i = 0; i < values.length; i++)
            this.push(values[i]);
        // var start_i = Object.keys(this).length;
        // var t_values = {};
        // for (var i = 0; i < values.length; i++)
        //     t_values[start_i + i] = values[i];
        //
        // this._field.set(t_values);
    }},

    set: { value:
    function(array) {
        var length = this.length;

        for (var i = 0; i < length - array.length; i++)
            this.pop();

        this._field.set(array);
    }},

    toString: { value:
    function() {
        return '[ Array ]';
    }},

    value: {
    get: function() {
        return this._field.val();
    }}

});
Field_Array.Class.prototype = Field_Array;
