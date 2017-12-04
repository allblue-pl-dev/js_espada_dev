'use strict';


var Field = {
    self: null,

    TYPE_UNDEFINED: 0,
    TYPE_VAR: 1,
    TYPE_RAW_OBJECT: 2,
    TYPE_ARRAY: 4,
    TYPE_FUNCTION: 8,

    PUBLIC_METHODES: ['set', 'onChange', 'pop', 'push', 'unset'],


    _root: null,
    _parent: null,
    _fields: null,
    _name: '',
    _fullName: '',
    _type: 0,
    _value: null,

    _listeners_OnUpdate: null,

    _public: null,

    Class: function(parent, fields, name, value)
    {
        var self = this.self = this;

        if (Field.PUBLIC_METHODES.indexOf(name) !== -1)
            throw new Error('Field name `' + name + '` is reserved.');

        value = typeof value === 'undefined' ? null : value;

        self._root = parent === null ? self : parent._root;
        self._parent = parent;
        self._fields = fields;
        self._name = name;
        self._fullName = parent === null ? name : parent._fullName + '.' + name;

        self._listeners_OnUpdate = [];

        self._fields[self._fullName] = self;

        self._setValue(value, false, false);
    },

    addEventListener_OnChange: function()
    {
        var self = this.self;

        if (arguments.length === 1) {
            self._listeners_OnUpdate.push(arguments[0]);
            return self;
        } else if (arguments.length === 2) {
            if (!self.exists(arguments[0])) {
                console.warn(new Error('Field ' + arguments[0] +
                        '` does not exist. Creating...'));

                self._addField(arguments[0], null);
            }

            self.get(arguments[0])._listeners_OnUpdate
                .push(arguments[1]);

            return self;
        }

        throw new TypeError('Wrong number of arguments.');
    },

    create: function(field_name, value)
    {
        var self = this.self;

        value = typeof value === 'undefined' ? null : value;

        var field;
        if (self.exists(field_name)) {
            /* If field exists return it with warning. */
            console.warn(new Error('Field `' + full_field_name +
                    '` already exists.'));

            field = self.get(field_name);
            field._setValue(value, false, true);

            return field;
        }

        field_name = String(field_name);
        var child_field_name_start = field_name.indexOf('.');
        if (child_field_name_start === -1) {
            /* If new field is direct child of current field create it. */
            return self._addField(field_name, value);
        } else {
            /* Otherwise create Raw Object field from first field name part. */
            var child_field_name = field_name.substring(0,
                    child_field_name_start);

            if (self.exists(child_field_name))
                field = self.get(child_field_name);
            else
                field = self._addField(child_field_name, {});


            return field.create(field_name.substring(
                    child_field_name_start + 1), value);
        }
    },

    delete: function()
    {
        var self = this.self;

        var children = Object.keys(self._public);
        for (var i = 0; i < children.length; i++)
            self.unset(children[i]);

        if (self._parent !== null)
            delete self._parent._public[self._name];

        delete self._fields[self._fullName];

        /* Should be handled better. */
        // self.update(self._fullName);
        if (self._parent !== null)
            self._parent.update(self._fullName);
    },

    exists: function(field_name)
    {
        var self = this.self;

        return (self._fullName + '.' + field_name) in self._fields;
    },

    get: function(field_name)
    {
        var self = this.self;

        var full_field_name = self._fullName + '.' + field_name;

        if (!self.exists(field_name)) {
            // console.warn(new Error('Field ' + field_name +
            //         '` does not exist. Creating...'));

            return self._addField(field_name);
        }

        return self._fields[full_field_name];
    },

    getFullName: function()
    {
        var self = this.self;

        return self._fullName;
    },

    getName: function()
    {
        return this._name;
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    getRoot: function()
    {
        var self = this.self;

        return self._root;
    },

    isArray: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_ARRAY;
    },

    isFunction: function()
    {
        return this._type === Field.TYPE_FUNCTION;
    },

    isObject: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_OBJECT;
    },

    isRawObject: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_RAW_OBJECT;
    },

    isVar: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_VAR;
    },

    new: function(parent, fields, name, value, update)
    {
        var self = this.self;

        return new Field.Class(parent, fields, name, value, update);
    },

    set: function()
    {
        var self = this.self;

        if (arguments.length === 1)
            self._setValue(arguments[0], true, true);
        else if (arguments.length >= 2) {
            if (self.exists(arguments[0]))
                self.get(arguments[0])._setValue(arguments[1], true, true);
            else {
                self.create(arguments[0], arguments[1]);
                self.update(arguments[0]);
            }
        } else
            throw new TypeError('Wrong number of arguments.');

        return self;
    },

    unset: function(field_name)
    {
        var self = this.self;

        if (!self.exists(field_name)) {
            console.warn(new Error('Field `' + self._fullName + '.' +
                    field_name + '` does not exist. Nothing to unset.'));
            return;
        }

        self.get(field_name).delete();
    },

    update: function(field_name)
    {
        var self = this.self;

        for (var i = 0; i < self._listeners_OnUpdate.length; i++)
            self._listeners_OnUpdate[i](field_name);
    },

    val: function()
    {
        var self = this.self;

        if (self._type & (Field.TYPE_RAW_OBJECT | Field.TYPE_ARRAY))
            return self._public;

        return self._value;
    },

    _addField: function(field_name, value)
    {
        var self = this.self;

        var full_field_name = self._fullName + '.' + field_name;

        var field = self.new(self, self._fields, field_name, value);

        Object.defineProperty(self._public, field_name, {
            get: function() {
                return field.val();
            },
            set: function(value) {
                // console.log('Val: '  + value);
                field.set(value);
            },
            enumerable: true,
            configurable: true
        });

        return field;
    },

    _setValue: function(value, update, update_parent)
    {
        var self = this.self;

        var is_raw_object = Helper.IsRawObject(value);
        var is_array = Helper.IsArray(value);

        var is_field_object = false;
        /* Not sure about `value instanceof Object`. Might need changing. */
        if (value !== null && typeof(value) !== 'undefined' &&
                value instanceof Object) {
            is_field_object =
                    Object.getPrototypeOf(value) === Field_Object ||
                    Object.getPrototypeOf(value) === Field_Array;
        }

        // console.log('Setting: ', self._fullName, value);
        // if (self.getRoot().exists('list.0'))
        //     console.log('list.0', self.getRoot().get('list.0').val());
        // else
        //     console.log('list.0', null);

        //console.log('PreSetting', self._fullName, value);

        if (is_raw_object || is_array || is_field_object) {
            if (self._type === Field.TYPE_UNDEFINED) {
                if (is_raw_object) {
                    if (self._type !== Field.TYPE_RAW_OBJECT) {
                        self._public = new Field_Object.Class(self);
                        self._type = Field.TYPE_RAW_OBJECT;
                    }
                } else if (is_array) {
                    if (self._type !== Field.TYPE_ARRAY) {
                        self._public = new Field_Array.Class(self);
                        self._type = Field.TYPE_ARRAY;
                    }
                }
            } else if (is_array) {
                var length = self._public.length;
                for (var i = 0; i < length - Object.keys(value).length; i++)
                    self._public.pop();
            }

            //console.log('A', self._fullName);

            self._value = null;
            //console.log('Before');
            for (var field_name in value) {
                var full_field_name = self._fullName + '.' + field_name;

                if (self.exists(field_name)) {
                    self.get(field_name)._setValue(value[field_name],
                            true, false);
                } else
                    self._addField(field_name, value[field_name]);
            }
        } else {
            if (!(self._type & (Field.TYPE_OBJECT |
                    Field.TYPE_FUNCTION | Field.TYPE_VAR)))
                self._public = new Field_Var.Class(self);

            if (Helper.IsObject(value))
                self._type = Field.TYPE_OBJECT;
            else if (Helper.IsFunction(value))
                self._type = Field.TYPE_FUNCTION;
            else
                self._type = Field.TYPE_VAR;

            self._value = value;
        }

        // if (self._type === Field.TYPE_ARRAY)
        //     console.log('HERE', value);

        if (update)
            self.update(self._fullName);

        if (update_parent) {
            if (self._parent !== null)
                self._parent.update(self._fullName);
        }

    }

};
Field.Class.prototype = Field;
