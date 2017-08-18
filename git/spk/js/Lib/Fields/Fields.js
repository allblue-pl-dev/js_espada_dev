'use strict';


var Fields = {
    self: null,

    Create: function()
    {
        return new Fields.Class().getPublic();
    },


    Class: function()
    {
        Field.Class.call(this, null, {}, '$', {});
    }

};
Fields.Class.prototype = Object.create(Field);
