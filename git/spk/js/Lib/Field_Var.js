'use strict';


var Field_Var = Object.create(null, {

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

    onChange: { value:
    function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        this._field.addEventListener_OnChange.apply(this._field, args);

        return this;
    }},

    value: {
    get: function() {
        return this._field.val();
    }}

});
Field_Var.Class.prototype = Field_Var;
