'use strict';


var Module = {
    self: null,

    CreateInfo: function(module_name, layout_names, init_fn_info)
    {
        if (Helper.IsArray(layout_names)) {
            var t_layout_names = {};
            for (var i = 0; i < layout_names.length; i++)
                t_layout_names[layout_names[i].replace(/{{name}}/g, module_name)] = layout_names[i];
            layout_names = t_layout_names;
        }

        for (var layout_alias in layout_names) {
            layout_names[layout_alias] = layout_names[layout_alias]
                    .replace(/{{name}}/g, module_name);
        }

        /**
         * Variants:
         * fn
         * fn, obj
         * fn, obj, fn,
         * obj,
         * obj, fn
         */

        var init_fn;
        var init_fn_prototype;

        if (!Helper.IsArray(init_fn_info))
            init_fn_info = [init_fn_info, null];

        if (init_fn_info.length === 1)
            init_fn_info.push(null);

        if (Helper.IsArray(init_fn_info)) {
            init_fn_prototype = Object.create(Object.create(
                    init_fn_info[1], Module.PublicProperties), {

                Class: { value:
                function(module, init_fn, init_fn_args) {
                    Object.defineProperties(this, {
                        private: { value: module }
                        // _public: { value: {}, writable: true }
                    });

                    if (init_fn === null) {
                        throw new Error('Module `' + module._name +
                                '` is static only.');
                    }
                    init_fn.apply(this, init_fn_args);
                }}

            });

            init_fn_prototype.Class.prototype = init_fn_prototype;

            if (init_fn_info.length > 2)
                init_fn_info[2](init_fn_prototype);

            init_fn = init_fn_info[0];
        } else {
            /* Should never happend. To be removed. */
            init_fn_prototype = Module_DefaultPublic;
            init_fn = init_fn_info;
        }

        return {
            layoutNames: layout_names,
            initFnPrototype: init_fn_prototype,
            initFn: init_fn
        };
    },

    PublicProperties: {

        // $activeLayout: {
        // get: function() {
        //     return this.private._activeLayout;
        // }},

        $app: {
        get: function() {
            return this.private._app.getPublic();
        }},

        $elems: { configurable: true,
        get: function() {
            if (this.$layout === null)
                return null;

            return this.$layout.$elems;
        }},

        $fields: { configurable: true,
        get: function() {
            if (this.$layout === null)
                return null;

            return this.$layout.$fields;
        }},

        $holders: { configurable: true,
        get: function() {
            if (this.$layout === null)
                return null;

            return this.$layout.$holders;
        }},

        $layout: {
        get: function() {
            if ('layout' in this.private._current)
                return this.private._current.layout;

            var layout_names = Object.keys(this.$layouts);

            if (layout_names.length === 0)
                return null;

            return this.$layouts[layout_names[0]];
        },
        set: function(value) {
            this.private._current.layout = value;
        }},

        $layouts: {
        get: function() {
            return this.private._public_Layouts;
        }},

        $name: {
        get: function() {
            return this.private.getName();
        }},

        // $public: {
        // get: function() {
        //     var self = this;
        //     if (this.private._public_Public === null) {
        //         this.private._public_Public = Object.create(null, {
        //             $private: {
        //             get: function() {
        //                 return self;
        //             }},
        //
        //             private: {
        //             get: function() {
        //                 return this.$private;
        //             }}
        //         });
        //     }
        //
        //     return this.private._public_Public;
        // },
        // set: function(object) {
        //     if (!Helper.IsObject(object))
        //         throw new Error('`public` must be an object.');
        //
        //     var self = this;
        //     if (object !== this) {
        //         if ('$private' in object) {
        //             throw new Error('`$private` is a reserved keyword in' +
        //                     ' `public` object.');
        //         }
        //
        //         Object.defineProperties(object, {
        //             $private: {
        //             get: function() {
        //                 return self;
        //             }},
        //
        //             private: {
        //             get: function() {
        //                 return this.$private;
        //             }}
        //         });
        //     }
        //
        //     this.private._public_Public = object;
        // }},

        $view: {
        get: function() {
            if (this.private._activeLayout !== null)
                return this.private._activeLayout;
            if (this.private._activeModule !== null)
                return this.private._activeModule._public;

            return null;
        },
        set: function(value) {
            if (value === null) {
                this.private.setLayout(null);
                return;
            }

            var prototype = Object.getPrototypeOf(value.private);

            if (prototype === Layout)
                this.private.setLayout(value);
            else if (prototype === Module)
                this.private.setModule(value);
            else {
                // throw new Error('`view` must be Layout or Module.');
                this.private.setModule(value.private);
            }
        }}

    },


    // _fields: null,
    _name: null,
    _app: null,

    _rootElem: null,

    _layouts: null,

    _activeLayout: null,
    _activeModule: null,

    _public: null,
    _public_Layouts: null,
    _public_Public: null,

    _current: null,

    Class: function(name, app, module_info, init_fn_args)
    {
        var self = this.self = this;

        self._name = name;
        self._app = app;
        self._layouts = {};
        self._layoutNames = module_info.layoutNames;
        /* Fields */
        // self._fields = new Fields.Class();

        this._current = {};

        self._create_Publics(module_info.initFnPrototype,
                module_info.initFn, init_fn_args);
    },

    activate: function(root_elem)
    {
        var self = this.self;

        self._rootElem = root_elem;

        if (self._activeLayout !== null)
            self._activeLayout.activate(root_elem);
        else if (self._activeModule !== null)
            self._activeModule.activate(root_elem);
    },

    deactivate: function(unset_root_elem)
    {
        unset_root_elem = typeof unset_root_elem === 'undefined' ?
                true : unset_root_elem;

        var self = this.self;

        if (self._activeLayout !== null) {
            self._activeLayout.deactivate(self._rootElem);
            // self._activeLayout = null;
        } else if (self._activeModule !== null) {
            self._activeModule.deactivate();
            // self._activeModule = null;
        }

        if (unset_root_elem)
            self._rootElem = null;
    },

    getApp: function()
    {
        var self = this.self;

        return self._app;
    },

    getName: function()
    {
        var self = this.self;

        return self._name;
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    getPublic_Layouts: function()
    {
        var self = this.self;

        return self._public_Layouts;
    },

    getPublic_Public: function()
    {
        var self = this.self;

        return self._public_Public;
    },

    setModule: function(module)
    {
        var self = this.self;

        var root_elem = self._rootElem;

        self.deactivate(false);

        if (self._rootElem !== null)
            module.private.activate(self._rootElem);

        self._activeLayout = null;
        self._activeModule = module.private;
    },

    setLayout: function(layout)
    {
        var self = this.self;

        layout = layout.private;

        self.deactivate(false);

        if (self._rootElem !== null)
            layout.activate(self._rootElem);

        self._activeModule = null;
        self._activeLayout = layout;
    },

    _create_Publics: function(init_fn_prototype, init_fn, init_fn_args)
    {
        var self = this.self;

        /* Layouts */
        self._public_Layouts = {};
        Object.keys(self._layoutNames).forEach(function(layout_id) {
            Object.defineProperty(self._public_Layouts, layout_id, {
                get: function() {
                    if (typeof self._layouts[layout_id] === 'undefined') {
                        self._layouts[layout_id] = self._app.createLayout(
                                self._layoutNames[layout_id]);
                    }

                    return self._layouts[layout_id].getPublic();
                },
                enumerable: true
            });
        });

        /* $private */
        self._public = new init_fn_prototype.Class(self, init_fn,
                init_fn_args);

        /* $public */
        if (!('$public' in self._public))
            self._public.$public = {};
        else if (self._public.$public !== this._public)
            self._public.$public = Object.create(self._public.$public, {});

        if (!Helper.IsObject(self._public))
            throw new Error('`public` must be an object.');

        if (self._public.$public !== self._public) {
            if ('_private' in self._public.$public) {
                throw new Error('`_private` is a reserved keyword in' +
                        ' `$public` object.');
            }

            Object.defineProperties(self._public.$public, {
                _private: {
                get: function() {
                    return self._public;
                }},

                private: {
                get: function() {
                    return this._private;
                }}
            });
        }

        this._public_Public = self._public.$public;
    }

};
Module.Class.prototype = Module;
