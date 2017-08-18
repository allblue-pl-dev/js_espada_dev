'use strict';

SPK

.Module('abUI_SelectButton', [ '{{name}}' ], [
function(options) {
    this.$public = this;
    var self = this;

    this.setOptions(options);

    this.$elems.onCreate('button', function(elem, option) {
        elem.addEventListener('click', function(evt) {
            self.set(option.value);
        });
    });

    this.$view = this.$layout;
}, {

    value: null,
    options: null,

    get: function()
    {
        return this.value;
    },

    onChange: function(value)
    {

    },

    set: function(value, trigger_on_change)
    {
        trigger_on_change = typeof trigger_on_change === 'undefined' ?
                true : trigger_on_change;

        this.setErrors([]);

        this.value = null;
        var found = false;
        for (var i = 0; i < this.options.length; i++) {
            var option = this.options[i];

            if (option.value === value) {
                this.$fields.options[i].selectedClass = 'selected';
                this.value = value;
                found = true;
            } else
                this.$fields.options[i].selectedClass = '';
        }

        if (this.value !== null && !found)
            throw new Error('Option `' + value + '` not found.');

        if (trigger_on_change)
            this.onChange(this.value);
    },

    setErrors: function(errors)
    {
        if (errors.length > 0) {
            this.$fields.error_Show = true;
            this.$fields.error = errors.join(' ');
        } else {
            this.$fields.error_Show = false;
            this.$fields.error = '';
        }
    },

    setOptions: function(options)
    {
        this.options = options;
        this.$fields.options =  options;

        this.set(this.value, false);
    }

}]);
