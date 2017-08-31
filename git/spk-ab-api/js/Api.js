'use strict';

SPK

.Module('abApi', [], [ null, {
$: {

    RequestTimeout: 30000,

    json: function(uri, json, fn, timeout) {
        var json_string = JSON.stringify(json);
        if (json_string === null)
            throw new Error('Cannot parse json.');

        this.post(uri, { json: json_string }, fn, timeout);
    },

    post: function(uri, fields, fn, timeout) {
        timeout = typeof timeout === 'undefined' ?
                this.RequestTimeout : timeout;

        var form_data = new FormData();
        for (var field_name in fields)
            form_data.append(field_name, fields[field_name]);

        var request = new XMLHttpRequest();

        request.open('POST', uri, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var result = SPK.$abApi.Result.Parse(request.responseText, uri);

                SPK.LogD(uri, result);

                fn(result);
            } else {
                if (status === 408)
                    fn(SPK.$abApi.Result.ConnectionError());
                else
                    fn(SPK.$abApi.Result.Error('Http request error.'));
            }
        };
        request.send(form_data);
    },

    upload: function(uri, json, files, fn, timeout) {
        var fields = {};
        for (var file_name in files)
            fields[file_name] = files[file_name];

        var json_string = JSON.stringify(json);
        if (json_string === null)
            throw new Error('Cannot parse json.');
        fields.json = json_string;

        this.post(uri, fields, fn, timeout);
    },


    Result: {
        self: null,

        Parse: function(data_string, uri)
        {
            var data = null;
            try {
                data = JSON.parse(data_string);
            } catch (err) {

            }

            if (data === null) {
                var result = SPK.$abApi.Result.Error(
                        'Cannot parse json data from: ' + uri);
                result.data.data = data_string;

                if (SPK.Debug)
                    console.error(data_string);

                return result;
            }

            var result = new SPK.$abApi.Result.Class();

            if (!('result' in data)) {
                result.result = 2;
                result.message = 'No result info in json data.';
            } else {
                result.result = data.result;
                if ('message' in data)
                    result.message = data.message;
                result.data = data;
            }

            return result;
        },

        Error: function(message)
        {
            var result = new SPK.$abApi.Result.Class();
            result.result = 2;
            result.message = message;
            result.data = {};

            return result;
        },

        Error_Connection: function(message)
        {
            var result = new SPK.$abApi.Result.Class();
            result.result = 3;
            result.message = message;
            result.data = {};

            return result;
        },


        result: 3,
        message: '',
        data: null,

        Class: function()
        {
            var self = this.self = this;
        },

        isSuccess: function()
        {
            var self = this.self;

            return self.result === 0;
        },

        isFailure: function()
        {
            var self = this.self;

            return self.result === 1;
        },

        isError: function()
        {
            var self = this.self;

            return self.result === 2;
        },

        isError_Connection: function()
        {
            var self = this.self;

            return self.result = 3;
        }
    }

}

}, function(module_prototype) {
    module_prototype.$.Result.Class.prototype = module_prototype.$.Result;
}]);
