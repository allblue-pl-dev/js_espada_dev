'use strict';


var Module_Public_Public = Object.create(null, {

    private: {value: null, writable: true },

    Class: { value:
    function(module_public) {
        Object.defineProperties(this, {
            private: { value: module_public }
        });
    }}

});
Module_Public_Public.Class.prototype = Module_Public_Public;
