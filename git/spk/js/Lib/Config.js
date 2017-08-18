'use strict';


var Config = {
    self: null,

    _public: null,

    /* */
    _base: '/',
    _version: '0',

    /* Layouts */
    _layoutNames: null,
    _layoutInfosSrc: '/layouts.json',
    _layoutInfosBase: '/',

    /* RootElems */
    _rootElemInfos: null,

    /* Pages */
    _pages: null,
    _defaultPageName: null,

    Class: function()
    {
        this.self = this;
        var self = this;

        self._layoutNames = [];
        self._rootElemInfos = [];
        self._pages = [];

        self._createPublic();
    },

    getBase: function()
    {
        var self = this.self;

        return self._base;
    },

    getDefaultPageName: function()
    {
        var self = this.self;

        return self._defaultPageName;
    },

    getLayoutNames: function()
    {
        var self = this.self;

        return self._layoutNames;
    },

    getLayoutInfosBase: function()
    {
        var self = this.self;

        return self._layoutInfosBase;
    },

    getLayoutInfosSrc: function()
    {
        var self = this.self;

        return self._layoutInfosSrc;
    },

    getRootElemInfos: function()
    {
        var self = this.self;

        return self._rootElemInfos;
    },

    getPages: function()
    {
        var self = this.self;

        return self._pages;
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    getVersion: function()
    {
        return this._version;
    },

    /* Helpers */
    _checkState: function()
    {
        var self = this.self;

        if (Spocky.IsInitialized())
            throw new Error('Cannot configure after initialization.');
    },

    _createPublic: function()
    {
        var self = this.self;

        self._public = {};

        Public.Create(self._public, {
            get: {
                base: function(base_uri) {
                    self._checkState();
                    self._base = base_uri;

                    return self._public;
                },
                defaultPage: function(page_name) {
                    self._checkState();
                    self._defaultPageName = page_name;

                    return self._public;
                },
                layout: function(layout_name) {
                    self._checkState();
                    self._layoutNames.push(layout_name);

                    return self._public;
                },
                layoutsInfo: function(layouts_info_src, layouts_info_base) {
                    self._checkState();

                    self._layoutInfosSrc = layouts_info_src;
                    self._layoutInfosBase = layouts_info_base;

                    return self._public;
                },
                module: function(elem_id, module_id, module_name) {
                    self._checkState();

                    module_name = typeof module_name === 'undefined' ?
                            module_id : module_name;

                    if (!(elem_id in self._rootElemInfos))
                        self._rootElemInfos[elem_id] = [];

                    self._rootElemInfos[elem_id].push({
                        moduleId: module_id,
                        moduleName: module_name
                    });

                    return self._public;
                },
                page: function(name, alias, title) {
                    self._checkState();

                    self._pages[name] = {
                        name: name,
                        alias: alias,
                        title: title
                    };

                    if (self._defaultPageName === null)
                        self._defaultPageName = name;

                    return self._public;
                },
                version: function(version)
                {
                    self._version = version;
                }
            }
        });
    }

};
Config.Class.prototype = Config;
