'use strict';


var View = {

    IsViewable: function(obj)
    {
        if (!('$view' in obj))
            return false;

        return View.isPrototypeOf(obj.$view);
    },

    Class: function(activate, deactivate)
    {

    }

};
View.Class.prototype = View;
