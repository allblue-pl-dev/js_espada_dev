'use strict';


var App_Public = Object.create({
    private: null
}, {
    Class: { value:
    function(app) {
        Object.defineProperties(this, {
            private: { value: app }
        });
    }},

    createLayout: { value:
    function(layout_name) {
        return this.private.createLayout(layout_name).getPublic();
    }},

    createModule: { value:
    function(module_name) {
        var args = [module_name];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);

        return this.private.createModule.apply(this.private, args)
                .getPublic().$public;
    }},

    getUri: { value:
    function(page_name, args) {
        var pages = this.private._config.getPages();

        if (!(page_name in pages)) {
            console.warn('Page `%s` does not exist.', page_name);
            return null;
        }

        return this.private.getPageUri(pages[page_name].alias, args);
    }},

    onNodeCreated: { value:
    function(fn) {
        this.private.listeners_OnNodeCreated.push(fn);
    }},

    onModuleCreated: { value:
    function(fn) {
        this.private.listeners._OnModuleCreated.push(fn);
    }},

    onPageChange: { value:
    function(fn) {
        this.private._listeners_OnPageChanged.push(fn);

        if (this.private._currentPage !== null)
            fn();
    }},

    page: {
    get: function() {
        return this.private._currentPageInfo;
    }},

    parseUri: {
    value: function(uri, args) {
        args = typeof args === 'undefined' ? [] : args;
        return this.private.getPageUri(uri, args, null, true);
    }},

    setPage: { value:
    function(page_name, uri_args, push_state) {
        this.private.setPage(page_name, uri_args, push_state);
    }},

    setUri: { value:
    function(uri) {
        this.private.setUri(uri);
    }},

    when: { value:
    function(page_name, fn) {
        this.private._listeners_OnPageSet.push({
            pageName: page_name,
            fn: fn
        });

        if (this.private._currentPage.name === page_name)
            fn();
    }}

});
App_Public.Class.prototype = App_Public;
