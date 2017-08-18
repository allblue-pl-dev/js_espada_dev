'use strict';


var Public = {

    Create: function(obj, properties)
    {
        Object.keys(properties).forEach(function(type) {
            Object.keys(properties[type]).forEach(function(name) {
                var property = {};
                property[type] = function() {
                    return properties[type][name];
                };

                Object.defineProperty(obj, name, property);
            });
        });

        return obj;
    }
};
