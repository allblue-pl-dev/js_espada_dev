'use strict';


var FieldBackup = {
    self: null,

    TYPE_VAR: 0,
    TYPE_RAW_OBJECT: 1,
    TYPE_FUNCTION: 2,

    PUBLIC_METHODES: ['set', 'change', 'unset'],


    _parent: null,
    _fields: null,
    _fieldInfos: null,
    _name: '',
    _fullName: '',
    _type: 0,
    _value: null,

    _listeners_OnUpdate: null,

    _public: null,

    Class: function(parent, fields, field_infos, name, value)
    {
        var self = this.self = this;

        if (Field.PUBLIC_METHODES.indexOf(name) !== -1)
            throw new Error('Field name `' + name + '` is reserved.');

        value = typeof value === 'undefined' ? null : value;

        self._parent = parent;
        self._fields = fields;
        self._fieldInfos = field_infos;
        self._name = name;
        self._fullName = parent === null ? name : parent._fullName + '.' + name;

        self._listeners_OnUpdate = [];

        self._create();

        self._set(value);
    },

    create: function(field_name, value)
    {
        var self = this.self;

        value = typeof value === 'undefined' ? null : value;

        if (self.exists(field_name)) {
            console.warn(new Error('Field `' + full_field_name +
                    '` already exists.'));

            return self.get(field_name);
        }

        var child_field_name_start = field_name.indexOf('.');
        if (child_field_name_start === -1)
            return self._addField(field_name, value);
        else {
            var child_field_name = field_name.substring(0,
                    child_field_name_start);

            var field;

            if (self.exists(child_field_name))
                field = self.get(child_field_name);
            else
                field = self._addField(child_field_name, {});

            return field.create(
                    field_name.substring(child_field_name_start + 1));
        }
    },

    exists: function(field_name)
    {
        var self = this.self;

        return self._fullName + '.' + field_name in self._fields;
    },

    get: function(field_name)
    {
        var self = this.self;

        var full_field_name = self._fullName + '.' + field_name;

        if (!self.exists(field_name)) {
            console.warn(new Error('Field ' + field_name +
                    '` does not exist. Creating...'));

            return self._addField(field_name);
        }

        return self._fields[full_field_name];
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    getFullName: function()
    {
        var self = this.self;

        return self._fullName;
    },

    isVar: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_VAR;
    },

    isRawObject: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_RAW_OBJECT;
    },

    isObject: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_OBJECT;
    },

    isFunction: function()
    {
        var self = this.self;

        return self._type === Field.TYPE_FUNCTION;
    },

    onChange: function()
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

    set: function()
    {
        var self = this.self;

        if (arguments.length === 1)
            self._set(arguments[0]);
        else if (arguments.length === 2) {
            if (self.exists(arguments[0]))
                self._addField(arguments[0], arguments[1]);
            else
                self.get(arguments[0])._set(arguments[1]);
        } else
            throw new TypeError('Wrong number of arguments.');

        if (self._parent !== null)
            self._parent._update(true);

        return self;
    },

    val: function()
    {
        var self = this.self;

        if (self._type === Field.TYPE_RAW_OBJECT)
            return self._public;

        return self._value;
    },

    _addField: function(field_name, value)
    {
        var self = this.self;

        self._type = Field.TYPE_RAW_OBJECT;

        if (!Helper.IsRawObject(self.val()))
            self._value = {};

        var full_field_name = self._fullName + '.' + field_name;

        var field = new Field.Class(self, self._fields, self._fieldInfos,
                field_name, value);

        Object.defineProperty(self._public, field_name, {
            get: function() {
                return field.val();
            },
            set: function(value) {
                field.set(value);
            },
            enumerable: true
        });

        return field;
    },

    _create: function()
    {
        var self = this.self;

        self._fields[self._fullName] = self;

        self._create_ParseFieldInfo();
        self._create_Public();
    },

    _create_ParseFieldInfo: function()
    {
        var self = this.self;

        var field_info = null;
        for (var i = 0; i < self._fieldInfos.length; i++) {
            var t_field_info = self._fieldInfos[i];

            if (t_field_info.info.virtual) {
                if (t_field_info.regexp.test(self._fullName)) {
                    field_info = t_field_info;
                    break;
                }
            } else {
                if (t_field_info.name === self._fullName) {
                    field_info = t_field_info;
                    break;
                }
            }
        }

        if (field_info === null)
            return;

        field_info.createFn(self, field_info.info);
    },

    _create_Public: function()
    {
        var self = this.self;

        self._public = {};

        Object.defineProperty(self._public, 'set', {
            value: function() {
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);

                self.set.apply(self, args);

                return self._public;
            },
            enumerable: false
        });

        Object.defineProperty(self._public, 'unset', {
            value: function(key) {
                // delete self.val()[key];
            },
            enumerable: false
        });

        Object.defineProperty(self._public, 'onChange', {
            value: function() {
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);

                self.onChange.apply(self, args);

                return self._getter;
            },
            enumerable: false
        });
    },

    _set: function(value)
    {
        var self = this.self;

        if (Helper.IsRawObject(value)) {
            self._type = Field.TYPE_RAW_OBJECT;

            var empty = true;
            for (var field_name in value) {
                var full_field_name = self._fullName + '.' + field_name;

                if (self.exists(field_name))
                    self.get(field_name)._set(value[field_name]);
                else
                    self._addField(field_name, value[field_name]);

                empty = false;
            }

            if (empty)
                self._value = {};
        } else {
            if (Helper.IsObject(value))
                self._type = Field.TYPE_OBJECT;
            else if (Helper.IsFunction(value))
                self._type = Field.TYPE_FUNCTION;
            else
                self._type = Field.TYPE_VAR;

            self._value = value;
        }

        self._update(false);

        return self;
    },

    _update: function(update_parent)
    {
        var self = this.self;

        for (var i = 0; i < self._listeners_OnUpdate.length; i++)
            self._listeners_OnUpdate[i]();

        if (update_parent)
            if (self._parent !== null)
                self._parent._update();
    }

};
FieldBackup.Class.prototype = FieldBackup;
