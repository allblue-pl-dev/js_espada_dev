'use strict';


var Field_Object = Object.create(null, {

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

    set: { value:
    function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        this._field.set.apply(this._field, args);

        return this;
    }},

    unset: { value:
    function(field_name) {
        this._field.unset(field_name);
    }},

    update: { value:
    function(field_name) {
        this._field.get(field_name).update(null);
    }},

    val: {
    get: function() {
        return this._field.val();
    }},

    value: {
    get: function() {
        return this._field.val();
    }}

});
Field_Object.Class.prototype = Field_Object;
