'use strict';


var Elem = Object.create(null, {

    Index_HtmlNode: { value: 0 },
    Index_ArgInfos: { value: 1 },

    Info_Index_Name: { value: 0 },
    Info_Index_Args: { value: 1 },


    _listeners_OnCreate: { value: null, writable: true },
    _listeners_OnDestroy: { value: null, writable: true },

    Class: { value:
    function(fields) {
        Object.defineProperties(this, {
            _fields: { value: fields },
            _elemInfos: { value: [] },

            _public: { value: new Elem.Public.Class(this) }
        });
    }},

    add: { value:
    function(html_node, elem_info) {
        this._elemInfos.push([
            html_node,
            typeof elem_info[Elem.Info_Index_Args] === 'undefined' ?
                    [] : elem_info[Elem.Info_Index_Args]
        ]);

        if (this._listeners_OnCreate !== null) {
            var args = this._getArgValues(this._elemInfos.length - 1);

            for (var i = 0 ; i < this._listeners_OnCreate.length; i++)
                this._listeners_OnCreate[i].apply(this, args);
        }
    }},

    getFirstHtmlElem: { value:
    function() {
        if (this._elemInfos.length === 0)
            return null;

        return this._elemInfos[0][Elem.Index_HtmlNode].getHtmlElem();
    }},

    getPublic: { value:
    function() {
        return this._public;
    }},

    _getArgValues: { value:
    function(index) {
        var elem = this._elemInfos[index];

        var html_node = elem[Elem.Index_HtmlNode];
        var arg_infos = elem[Elem.Index_ArgInfos];

        var args = [html_node.get()];

        for (var i = 0; i < arg_infos.length; i++)
            args.push(this._fields.getValue(arg_infos[i]));

        return args;
    }},


    Public: { value:
    Object.create(null, {

        Class: { value:
        function(elem) {
            Object.defineProperties(this, {
                _elem: { value: elem }
            });
        }},

        each: { value:
        function(fn) {
            for (var i = 0; i < this._elem._elemInfos.length; i++) {
                fn(this._elem._elemInfos[i][Elem.Index_HtmlNode]
                        .getHtmlElem());
            }
        }},

        htmlElems: {
        get: function() {
            var html_elems = [];

            for (var i = 0; i < this._elem._elemInfos.length; i++) {
                html_elems.push(this._elem._elemInfos[i][Elem.Index_HtmlNode]
                        .getHtmlElem());
            }

            return html_elems;
        }},

        onCreate: { value:
        function(fn) {
            if (this._elem._listeners_OnCreate === null)
                this._elem._listeners_OnCreate = [];

            this._elem._listeners_OnCreate.push(fn);

            for (var i = 0; i < this._elem._elemInfos.length; i++) {
                var args = this._elem._getArgValues(i);

                fn.apply(this, args);
            }
        }},

        onDestroy: { value:
        function(fn) {
            if (this._elem._listeners_OnDestroy === null)
                this._elem._listeners_OnDestroy = [];

            this._elem._listeners_OnDestroy.push(fn);
        }}

    })}

});
Elem.Class.prototype = Elem;
Elem.Public.Class.prototype = Elem.Public;
