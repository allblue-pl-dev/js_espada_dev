'use strict';


var App = {
    self: null,

    _public: null,

    _config: null,
    _moduleInfos: null,
    _layoutInfos: null,

    _rootElemModules: null,

    _listeners_OnModuleCreated: null,
    _listeners_OnPageChanged: null,
    _listeners_OnPageSet: null,

    _currentPage: null,
    _currentPageInfo: null,

    Class: function(config, module_infos, layout_infos)
    {
        var self = this.self = this;

        self._config = config;

        self._moduleInfos = module_infos;
        self._layoutInfos = layout_infos;

        self._rootElemModules = {};

        self._listeners_OnModuleCreated = [];
        self._listeners_OnNodeCreated = [];
        self._listeners_OnPageChanged = [];
        self._listeners_OnPageSet_Infos = [];
    },

    addEventListener_OnModuleCreated: function(fn)
    {
        var self = this.self;

        self._listeners_OnModuleCreated.push(fn);
    },

    addEventListener_OnPageChanged: function(fn)
    {
        var self = this.self;

        self._listeners_OnPageChanged.push(fn);
    },

    addEventListener_OnPageSet: function(fn)
    {
        var self = this.self;

        self._listeners_OnPageSet_Infos.push(fn);
    },

    createLayout: function(layout_name)
    {
        var self = this.self;

        if (!(layout_name in self._layoutInfos))
            throw new Error('Layout `' + layout_name + '` does not exist.');

        if (self._layoutInfos[layout_name] === null)
            throw new Error('Layout info `' + layout_name + '` not loaded.');

        return new Layout.Class(self, self._layoutInfos[layout_name]);
    },

    createModule: function(module_name)
    {
        var self = this.self;

        if (!(module_name in self._moduleInfos))
            throw new Error('Module `' + module_name + '` does not exist.');

        var args = [];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);

        var module = new Module.Class(module_name, self,
                self._moduleInfos[module_name], args);

        return module;
    },

    getPageUri: function(uri, args, parsed_args, path_only)
    {
        args = typeof args === 'undefined' ? {} : args;
        parsed_args = typeof parsed_args === 'undefined' ? null : parsed_args;
        path_only = typeof path_only === 'undefined' ? false : true;

        var uri_args = uri === '' ? [] : uri.split('/');
        if (uri_args[uri_args.length - 1] === '')
            uri_args.pop();

        var p_uri = '';
        for (var i = 0; i < uri_args.length; i++) {
            if (uri_args[i][0] !== ':') {
                p_uri += uri_args[i] + '/';
                continue;
            }

            var arg_info = this._getUriArgInfo(uri_args[i]);

            if (!(arg_info.name in args)) {
                p_uri += arg_info.defaultValue + '/';

                if (parsed_args !== null)
                    parsed_args[arg_info.name] = null;

                continue;
            }

            p_uri += args[arg_info.name] + '/';

            if (parsed_args !== null)
                parsed_args[arg_info.name] = String(args[arg_info.name]);
        }

        if (path_only)
            return p_uri;
        else
            return this._config.getBase() + p_uri;
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    initialize: function(init_fns, ext_infos)
    {
        this._execAppInitFns(init_fns);

        this._public = new App_Public.Class(this);
        this._createRootElemModules(this._config.getRootElemInfos());

        // self._execExtInitFns(ext_infos);

        var self = this;
        window.onpopstate = function() {
            self._parseUri(window.location.pathname + window.location.search);
        };
        this._parseUri(window.location.pathname + window.location.search);
    },

    setPage: function(page_name, args, push_state)
    {
        var self = this.self;

        args = typeof(args) === 'undefined' ? {} : args;
        push_state = typeof push_state === 'undefined' ? true : push_state;

        var pages = self._config.getPages();

        if (!(page_name in pages))
            throw new Error('Page `' + page_name + '` does not exist.`');

        var source = self._currentPage;
        self._currentPage = pages[page_name];
        self._currentPageInfo = {
            name: page_name,
            args: {}
        };

        var uri = this.getPageUri(self._currentPage.alias, args,
                self._currentPageInfo.args);

        if (push_state) {
            window.history.pushState({}, self._currentPage.title, uri);
            document.title = self._currentPage.title;
        } else {
            window.history.replaceState({}, self._currentPage.title, uri);
            document.title = self._currentPage.title;
        }

        for (var i = 0; i < self._listeners_OnPageSet_Infos.length; i++) {
            var info = self._listeners_OnPageSet_Infos[i];

            if (info.name === page_name)
                info.fn(self._currentPage);
        }

        for (var i = 0; i < self._listeners_OnPageChanged.length; i++)
            self._listeners_OnPageChanged[i](self._currentPage, source);
    },

    setUri: function(uri, push_state)
    {
        push_state = typeof push_state === 'undefined' ? true : push_state;
        this._parseUri(uri, push_state);
    },

    _createPublic: function()
    {
        var self = this.self;

        self._public = {};

        return Public.Create(self._public, {
            get: {
                createLayout: function(layout_name) {
                    return self.createLayout(layout_name).getPublic();
                },
                createModule: function(module_name) {
                    var args = [module_name];
                    for (var i = 1; i < arguments.length; i++)
                        args.push(arguments[i]);

                    return self.createModule.apply(self, args).getPublic();
                },
                onModuleCreated: function(fn) {
                    self._listeners_OnModuleCreated.push(fn);
                },
                onPageChange: function(fn) {
                    self._listeners_OnPageChanged.push(fn);
                },
                page: function(page_name) {
                    self.setPage(page_name);
                },
                when: function(page_name, fn) {
                    self._listeners_OnPageSet.push({
                        pageName: page_name,
                        fn: fn
                    });

                    if (app.currentPage.name === page_name)
                        fn();
                }
            }
        });
    },

    _createRootElemModules: function(root_elem_infos)
    {
        var self = this.self;

        for (var elem_id in root_elem_infos) {
            var elem = document.getElementById(elem_id);
            if (elem === null)
                throw new Error('Element `' + elem_id + '` does not exist.');

            var info = root_elem_infos[elem_id][0];

            var module = self.createModule(info.moduleName);
            self._rootElemModules[info.moduleId] = module.getPublic().$public;
            module.activate(elem);
        }
    },

    _execExtInitFns: function(ext_infos)
    {
        var self = this.self;

        for (var i = 0; i < ext_infos; i++)
            ext_infos.initFn(self._public);
    },

    _execAppInitFns: function(init_fns)
    {
        var self = this.self;

        for (var i = 0; i < init_fns.length; i++)
            init_fns[i]();
    },

    _getUriArgInfo: function(uri_arg)
    {
        var arg_name = uri_arg.substring(1);
        var arg_default = uri_arg;
        var arg_name_array = arg_name.split('#');
        if (arg_name_array.length > 1) {
            arg_name = arg_name_array[0];
            arg_default = arg_name_array[1];
        }

        return {
            name: arg_name,
            defaultValue: arg_default
        };
    },

    _parseUri: function(uri, push_state)
    {
        var self = this.self;

        push_state = typeof push_state === 'undefined' ? false : push_state;

        var pages = self._config.getPages();
        if (Object.keys(pages).length === 0)
            return;

        var base = self._config.getBase();
        base = base.substring(0, base.length);

        if (uri.indexOf(base) !== 0) {
            window.location = base;
            return;
        }

        uri = uri.substring(base.length);

        var uri_array = uri.split('/');
        if (uri_array[uri_array.length - 1] === '')
            uri_array.pop();

        for (var page_name in pages) {
            var page = pages[page_name];
            var alias_array = page.alias.split('/');

            if (alias_array.length != uri_array.length)
                continue;

            var args = {};
            var uri_matched = true;
            for (var i = 0; i < alias_array.length; i++) {
                if (alias_array[i].length === 0) {
                    uri_matched = false;
                    break;
                }

                if (alias_array[i][0] === ':') {
                    if (alias_array[i][0] === 1) {
                        uri_matched = false;
                        break;
                    }

                    var uri_arg_info = this._getUriArgInfo(alias_array[i]);

                    args[uri_arg_info.name] = uri_array[i];
                    continue;
                }

                if (alias_array[i] !== uri_array[i]) {
                    uri_matched = false;
                    break;
                }
            }

            if (!uri_matched)
                continue;

            self.setPage(page.name, args, push_state);
            return;
        }

        self.setPage(self._config.getDefaultPageName(), {} , push_state);
    }

};
App.Class.prototype = App;
