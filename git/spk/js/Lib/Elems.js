'use strict';


var Elems = Object.create(null, {

    Class: { value:
    function(fields) {
        Object.defineProperties(this, {
            _fields: { value: fields },
            _elems: { value: {}},
            _public: { value: new Elems.Public.Class(this) }
        });
    }},

    create: { value:
    function(info) {
        var elem_name = info[0];

        if (elem_name in this._elems) {
            console.warn('Elem `%s` already created.');
            return;
        }

        var elem = new Elem.Class(this._fields);
        this._elems[elem_name] = elem;

        Object.defineProperty(this._public, elem_name, {
            get: function() {
                return elem.getFirstHtmlElem();
            }
        });
    }},

    exists: { value:
    function(info) {
        return info[Elem.Info_Index_Name] in this._elems;
    }},

    get: { value:
    function(info) {
        var elem_name = info[Elem.Info_Index_Name];

        if (!this.exists(info))
            this.create(info);

        return this._elems[elem_name];
    }},

    getPublic: { value:
    function() {
        return this._public;
    }},


    Public: { value:
    Object.create(null, {

        Class: { value:
        function(elems) {
            Object.defineProperties(this, {
                _elems: { value: elems }
            });
        }},

        each: { value:
        function(elem_name, fn) {
            var elem_public = this.get(elem_name);
            elem_public.each(fn);
        }},

        get: { value:
        function(elem_name) {
            if (!(elem_name in this._elems._elems))
                throw new Error('Elem `' + elem_name + '` does not exist.');

            return this._elems._elems[elem_name].getPublic();
        }},

        htmlElems: { value:
        function(elem_name) {
            return this.get(elem_name).htmlElems;
        }},

        onCreate: { value:
        function(elem_name, fn) {
            var elem_public = this.get(elem_name);
            elem_public.onCreate(fn);
        }},

        onDestroy: { value:
        function(elem_name, fn) {
            var elem_public = this.get(elem_name);
            elem_public.onDestroy(fn);
        }},

    })}

});
Elems.Class.prototype = Elems;
Elems.Public.Class.prototype = Elems.Public;
