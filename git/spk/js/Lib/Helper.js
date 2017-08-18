'use strict';


var Helper = {

    IsArray: function(value)
    {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    IsFunction: function(value)
    {
        return Object.prototype.toString.call(value) === '[object Function]';
    },

    IsObject: function(value)
    {
        return Object.prototype.toString.call(value) === '[object Object]';
    },

    IsRawObject: function(value)
    {
        if (!Helper.IsObject(value))
            return false;

        return Object.getPrototypeOf(value) === Object.prototype;
    },

    IsString: function(value)
    {
        return Object.prototype.toString.call(value) === '[object String]';
    },

    Request_Get: function(url, fn)
    {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function() {
            var data = null;
            var error = null;

            if (request.status >= 200 && request.status < 400)
                data = request.responseText;
            else
                error = 'Server request error: ' + request.status;

            fn(data, error);
        };

        request.onerror = function() {
            fn(null, 'Request error.');
        };

        request.send();
    },

    Request_JSON: function(url, fn)
    {
        SPK.Request_Get(url, function(data, error) {
            if (error !== null)
                return fn(data, error);

            try {
                var json = JSON.parse(data);
            } catch (err) {
                error = err;
            }

            if (json === null)
                error = 'Cannot parse JSON data.';

            return fn(json, error);
        });
    },

};
