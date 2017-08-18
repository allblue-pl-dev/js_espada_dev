'use strict';


var Module_DefaultPublic = Object.create(Object.create(
        null, Module.PublicProperties), {

    Class: { value:
    function(module, init_fn, init_fn_args) {
        Object.defineProperties(this, {
            private: { value: module }
            // _public: { value: {}, writable: true }
        });

        init_fn.apply(this, init_fn_args);
    }}

});

Module_DefaultPublic.Class.prototype = Module_DefaultPublic;
