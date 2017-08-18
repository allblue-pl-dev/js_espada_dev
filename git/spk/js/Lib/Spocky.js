'use strict';


var Spocky = {

    _Initialized: false,
    _Config: null,

    _Debug: false,

    _LayoutInfos: {},
    _LayoutInfos_Src: null,
    _LayoutInfos_Uris: {},
    _ModuleInfos: {},
    _ExtInfos: [],
    _AppInitFns: [],

    _App: null,

    GetConfig: function()
    {
        if (Spocky._Config === null)
            Spocky._Config = new Config.Class();

        return Spocky._Config;
    },

    Initialize: function(debug)
    {
        if (Spocky._Initialized)
            throw new Error('SPK already initialized.');

        Spocky._Initialized = true;

        Spocky._Debug = typeof debug === 'undefined' ? false : debug;

        Spocky._Initialize_LayoutInfos().then(function() {
            Spocky._Initialize_App();
        }, function() {
            throw new Error('Cannot initialize layouts: ' + err);
        });
    },

    IsInitialized: function()
    {
        return Spocky._Initialized;
    },

    CheckInit: function()
    {
        if (Spocky.IsInitialized())
            throw new Error('Cannot modify after initialization.');
    },

    _GetVersionHash: function()
    {
        var hash = "";
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                'abcdefghijklmnopqrstuvwxyz' + '0123456789';

        for (var i=0; i < 20; i++)
            hash += chars.charAt(Math.floor(Math.random() * chars.length));

        return hash;
    },

    _Initialize_App: function()
    {
        Spocky._App = new App.Class(
            Spocky.GetConfig(),
            Spocky._ModuleInfos,
            Spocky._LayoutInfos
        );

        Spocky._App.initialize(Spocky._AppInitFns, Spocky._ExtInfos);
    },

    _Initialize_LayoutInfos: function() {
        return new Promise(function(resolve, reject) {
            /* Layout Names */
            var layout_names = [];

            var n_layout_names;

            /* Ext Layout Names */
            for (var i = 0; i < Spocky._ExtInfos.length; i++) {
                n_layout_names = Spocky._ExtInfos[i].layoutNames;

                for (var layout_id in n_layout_names)
                    if (layout_names.indexOf(n_layout_names[layout_id]) === -1)
                        layout_names.push(n_layout_names[layout_id]);
            }

            /* Module Layout Names */
            for (var module_name in Spocky._ModuleInfos) {
                n_layout_names = Spocky._ModuleInfos[module_name].layoutNames;

                for (var layout_id in n_layout_names)
                    if (layout_names.indexOf(n_layout_names[layout_id]) === -1)
                        layout_names.push(n_layout_names[layout_id]);
            }

            /* Config Layout Names */
            n_layout_names = layout_names.concat(
                    Spocky.GetConfig().getLayoutNames());
            for (var i = 0; i < n_layout_names.length; i++) {
                if (layout_names.indexOf(n_layout_names[i]) === -1)
                    layout_names.push(n_layout_names[i]);
            }

            /* Load Uris */
            var layout_infos_uri = Spocky.GetConfig().getLayoutInfosSrc();
            Spocky._LoadLayoutInfoUris(layout_infos_uri)
                .then(function(layout_info_uris) {
                    return Spocky._LoadLayoutInfos(layout_info_uris,
                            layout_names);
                }, function(error) {
                    reject(error);
                })
                .then(function() {
                    resolve();
                });
        });
    },

    _LoadLayoutInfoUris: function(uri)
    {
        return new Promise(function(resolve, reject) {
            uri += '?v=' + Spocky._GetVersionHash();

            Helper.Request_Get(uri, function(data, error) {
                if (error !== null) {
                    reject('Cannot get layout info uris from `' + uri +
                            '`: ' + error);
                }

                var data_json = null;
                try {
                    data_json = JSON.parse(data);
                } catch (err) {
                    reject('Cannot parse layout info uri JSON: ' + err);
                }

                resolve(data_json);
            });
        });
    },

    _LoadLayoutInfo: function(layout_name, uri)
    {
        return new Promise(function(resolve, reject) {
            uri = Spocky._Config.getLayoutInfosBase() + uri + '?v=' +
                    Spocky._GetVersionHash();

            Helper.Request_Get(uri, function(data, error) {
                if (error !== null) {
                    Spocky._LayoutInfos[layout_name] = null;
                    console.warn('Cannot get layout info from `' + uri +
                            '`: ' + error);
                    resolve();
                }

                var data_json = null;
                try {
                    data_json = JSON.parse(data);
                } catch (err) {
                    reject('Cannot parse layout info `' +
                            layout_name + '`: ' + err);
                }

                Spocky._LayoutInfos[layout_name] = data_json;
                resolve();
            });
        });
    },

    _LoadLayoutInfos: function(layout_info_uris, layout_names)
    {
        return new Promise(function(resolve, reject) {
            var promises = [];
            layout_names.forEach(function(layout_name) {
                if (!(layout_name in layout_info_uris)) {
                    reject('Cannot find uri for layout `' +
                            layout_name + '`');
                }

                promises.push(Spocky._LoadLayoutInfo(layout_name,
                        layout_info_uris[layout_name]));
            });

            Promise.all(promises).then(function() {
                resolve();
            }, function(error) {
                reject(error);
            });
        });

    },

Public: Object.create(null, {
    App: { value:
    function(init_fn) {
        Spocky.CheckInit();
        Spocky._AppInitFns.push(init_fn);

        return this;
    }},

    Config: { value:
    function() {
        return Spocky.GetConfig().getPublic();
    }},

    Debug: {
    get: function() {
        return Spocky._Debug;
    }},

    Ext: { value:
    function(layout_names, init_fn) {
        Spocky.CheckInit();
        Spocky._ExtInfos.push({
            layoutNames: layout_names,
            initFn: init_fn
        });
    }},

    Init: { value:
    function(debug) {
        return Spocky.Initialize(debug);
    }},

    LogD: { value:
    function() {
        var args = [ 'Debug:' ];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);
        args.push(new Error());
        console.log.apply(null, args);
    }},

    Module: { value:
    function(module_name, layout_names, init_fn_info) {
        Spocky.CheckInit();

        if (module_name in Spocky._ModuleInfos) {
            throw new Error('Module `' + module_name +
                    '` already exists.');
        }

        var module_info = Module.CreateInfo(module_name, layout_names, init_fn_info);

        if (!('$' in module_info.initFnPrototype))
            module_info.initFnPrototype.$ = {};

        Object.defineProperties(module_info.initFnPrototype.$, {
            create: {
            get: function() {
                return function() {
                    var args = [];
                    for (var i = 0; i < arguments.length; i++)
                        args.push(arguments[i]);

                    var module = new Module.Class(module_name, Spocky._App,
                            module_info, args);

                    return module._public.$public;
                }
            }
        }});

        Object.defineProperty(this.Modules, module_name, {
            get: function() {
                return module_info.initFnPrototype.$;
            }
        });

        Object.defineProperty(this, '$' + module_name, {
            get: function() {
                return module_info.initFnPrototype.$;
            }, enumerable: true
        });

        // console.log('Comparing:');
        // for (var t_module_name in Spocky._ModuleInfos) {
        //     console.log(module_name, t_module_name,
        //             Spocky._ModuleInfos[t_module_name]
        //             .initFnPrototype.Class.prototype ===
        //             module_info.initFnPrototype.Class.prototype);
        // }

        Spocky._ModuleInfos[module_name] = module_info;


        return this;
    }},

    Modules: { value: {}},

    WarnD: { value:
    function() {
        var args = ['Debug:'];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);
        args.push(new Error());

        console.warn.apply(console, args);
    }}

})

};
