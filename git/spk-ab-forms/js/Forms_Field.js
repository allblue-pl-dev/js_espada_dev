'use strict';

SPK

.Module('abForms_Field', {
    date: 'abForms_DateField',
    dateTime: 'abForms_DateField',
    file: 'abForms_FileField',
    hidden: 'abForms_HiddenField',
    input: 'abForms_InputField',
    radio: 'abForms_RadioField',
    select: 'abForms_SelectField',
    text: 'abForms_TextField',
    textarea: 'abForms_TextAreaField',
    time: 'abForms_DateField'
}, [ function(m_form, html_elem) {
    this.$public = new this.Public.Class(this);
    this.$layout = null;

    this.mForm = m_form;
    this.htmlElem = html_elem;

    this.name = null;
    this.type = null;
    this.fields = {};

    this.initialize();

    if (this.$layout === null)
        return;

    this.createElems();
    this.createFields();

    this.$view = this.$layout;
}, {

    valueFieldName: null,

    clearValidator: function()
    {
        this.$layout.$fields.validator.set({
            hasErrors: false,
            errors: [],
            divClass: ''
        });
    },

    createElems: function()
    {
        var self = this;

        var on_change = function(evt) {
            self.clearValidator();
        };

        if (this.type === 'date' || this.type === 'dateTime' ||
                this.type === 'time') {
            var format;
            if (this.type === 'date')
                format = SPK.$eText.get('SPK:date_Format');
            else if (this.type === 'dateTime')
                format = SPK.$eText.get('SPK:dateTime_Format');
            else if (this.type === 'time')
                format = SPK.$eText.get('SPK:time_Format');

            /* Initialize `date` field. */
            $(this.$elems.field)
                .datetimepicker( {
                    format: format,
                    showTodayButton: self.type !== 'time',
                    useCurrent: false,
                    locale: SPK.$eLang.tag.substring(0, 2)
                })
                .on('dp.show', function(evt) {
                    if($(this).data("DateTimePicker").date() === null)
                        $(this).data("DateTimePicker").date(moment());
                })
                .on('dp.hide', function(evt) {
                    self.$elems.field.setAttribute('value', this.value);
                    self.clearValidator();
                    this.blur();
                });
        } else if (this.type === 'radio') {
            this.$elems.each('field', function(elem) {
                elem.addEventListener('change', on_change);
            });
        } else if (this.type === 'select' || this.type === 'file') {
            this.$elems.field.addEventListener('change', on_change);
        } else if (this.type === 'input' || this.type === 'textarea' ||
                this.type === 'hidden') {
            if (this.type === 'input')
                this.fields.inputType = this.getAttr('input-type');

            this.$elems.field.addEventListener('change', on_change);
            this.$elems.field.addEventListener('keyup', on_change);

            // this.$elems.field.setAttribute('value', '');
        }
    },

    createFields: function()
    {
        this.fields.name = this.name;
        this.fields.label = this.getAttr('label', null);
        this.fields.placeholder = this.getAttr('placeholder', null);
        this.fields.labelClass = this.getAttr('label-class', '');
        this.fields.fieldClass = this.getAttr('field-class', '');
        this.fields.divClass = this.getAttr('div-class', '');

        this.$fields.set({
            field: this.fields,
            validator: {
                hasErrors: false,
                errors: [],
                divClass: ''
            }
        });
    },

    getAttr: function(attr_name, default_value)
    {
        var attr = this.htmlElem.getAttribute(attr_name);

        if (attr === null) {
            if (typeof default_value === 'undefined')
                throw new Error('Attribute `' + attr_name + '` not set.');

            return default_value;
        }

        return attr;
    },

    initialize: function()
    {
        this.name = this.htmlElem.getAttribute('name');
        this.type = this.htmlElem.getAttribute('type');

        if (this.name === null)
            throw new Error('`name` attribute not set.');

        if (this.type === null)
            throw new Error('`type` attribute not set.');

        if (!(this.type in this.$layouts)) {
            console.warn('Unknown field type `' + this.type + '`.');
            this.$layout = null;
            return;
        }

        this.$layout = this.$layouts[this.type];

        var value_field_name = this.htmlElem.getAttribute('value');
        if (value_field_name !== null) {
            var self = this;

            this.valueFieldName = value_field_name;

            this.htmlElem.addEventListener('change', function() {
                if (self.mForm.$fields[value_field_name] !==
                        self.$public.value)
                    self.mForm.$fields.set(value_field_name, self.$public.value);
            });

            this.mForm.$fields.onChange(value_field_name, function() {
                if (self.$public.value !== self.mForm.$fields[value_field_name])
                    self.$public.value = self.mForm.$fields[value_field_name];
            });

            /* Uncomment after #26. */
            // this.$public.value = this.mForm.$fields[value_field_name];
        }
    },

Public: Object.create(null, {

    Class: { value:
    function(field) {
        // Object.defineProperties(this, {
        //     _private: { value: field }
        // });
    }},

    clearValidator: { value:
    function() {
        this._private.clearValidator();
    }},

    elem: {
    get: function() {
        return this._private.$elems.field;
    }},

    elems: {
    get: function() {
        return this._private.$elems;
    }},

    $fields: {
    get: function() {
        return this._private.$layout.$fields;
    }},

    name: {
    get: function() {
        return this._private.name;
    }},

    value: {
    get: function() {
        var type = this._private.type;

        /* Date Time */
        if (type === 'date') {
            var value = this._private.$elems.field.value;

            return value === '' ? null : SPK.$abDate.date_StrToTime(value);
        } else if (type === 'dateTime') {
            var value = this._private.$elems.field.value;

            return value === '' ? null : SPK.$abDate.dateTime_StrToTime(value);
        } else if (type === 'time') {
            var value = this._private.$elems.field.value;

            return value === '' ? null : SPK.$abDate.time_StrToTime(value);
        } else if (type === 'file') {
            var file = this._private.$elems.field.files[0];
            return typeof file === 'undefined' ? null : file;
        } else if (this._private.type === 'text')
            return null;
        else if (this._private.type === 'radio') {
            var options = this._private.$elems.htmlElems('field');

            for (var i = 0; i < options.length; i++) {
                if (options[i].checked)
                    return options[i].getAttribute('value');
            }

            return '';
        } else if (this._private.type === 'input' &&
                this._private.fields.inputType === 'checkbox')
            return this._private.$elems.field.checked ? 1 : 0;

        return this._private.$elems.field.value;
    },
    set: function(value) {
        if (value === null)
            value = '';

        value = value + '';

        if (this._private.type === 'date' || this._private.type === 'dateTime' ||
                this._private.type === 'time') {
            var m = value === '' ? '' : moment(value * 1000)
                    .utcOffset(SPK.$abDate.utcOffset);
            $(this._private.$elems.field).data('DateTimePicker').date(m);
        } else if (this._private.type === 'file') {
            /* Do nothing. */
        } else if (this._private.type === 'radio') {
            var options = this._private.$elems.htmlElems('field');

            for (var i = 0; i < options.length; i++) {
                if (options[i].getAttribute('value') === value) {
                    options[i].checked = true;
                    return;
                }
            }
        } else if (this._private.type === 'input') {
            if (this._private.htmlElem.getAttribute('input-type') ===
                    'checkbox') {
                this._private.$elems.field.checked = value === 'true';
            } else
                this._private.$elems.field.value = value;
        } else if (this._private.type === 'select') {
            var elem = this._private.$elems.field;

            var selected = false;
            for (var i = 0; i < elem.options.length; i++) {
                if (elem.options[i].value === value + '') {
                    elem.options[i].selected = true;
                    selected = true;
                    break;
                }
            }

            if (!selected)
                console.warn('Cannot find option `' + value + '`.');
        } else if (this._private.type === 'text')
            this._private.$elems.field.innerHTML = value;
        else
            this._private.$elems.field.value = value;

        if (this._private.valueFieldName !== null)
            this._private.mForm.$fields[this._private.valueFieldName] = this.value;
    }},

    setDisabled: { value:
    function(disabled) {
        if (disabled)
            this._private.$elems.field.setAttribute('disabled', '');
        else
            this._private.$elems.field.removeAttribute('disabled');
    }},

    setValidator: { value:
    function(validator) {
        // this._private.$layout.$fields.validator.errors = ['Magda', 'Spock'];
        // this._private.$layout.$fields.validator.errors = ['Tylko Spock'];
        //console.log(this._private.$layout.$fields.validator.errors.length);

        this._private.$layout.$fields.validator.set({
            hasErrors: 'errors' in validator,
            errors: 'errors' in validator ? validator.errors : [],
            divClass: validator.state === 'error' ?
                    'has-error' : ''
        });

        this._private.changed = false;
    }}

})

}, function(prototype) {
    prototype.Public.Class.prototype = prototype.Public;
}])
