'use strict';

SPK.

Module('abForms_Form', [], [
function(form_layout) {
    this.$layout = form_layout;
    this.formFields = {};

    this.parseNodes(form_layout);

    this.$view = form_layout;
}, {

$public: Object.create(null, {

    clearValidator: { value:
    function() {
        for (var form_field_name in this._private.formFields)
            this._private.formFields[form_field_name].clearValidator();
    }},

    getField: { value:
    function(field_name) {
        if (!(field_name in this._private.formFields))
            throw new Error('Field `' + field_name + '` does not exist.');

        return this._private.formFields[field_name];
    }},

    getFields: { value:
    function() {
        return this._private.formFields;
    }},

    getFiles: { value:
    function() {
        var form_field_values = {};

        for (var form_field_name in this._private.formFields) {
            var form_field = this._private.formFields[form_field_name];
            if (form_field._private.type !== 'file')
                continue;

            form_field_values[form_field_name] = form_field.value;
        }

        return form_field_values;
    }},

    getValues: { value:
    function() {
        var form_field_values = {};

        for (var form_field_name in this._private.formFields) {
            var form_field = this._private.formFields[form_field_name];
            if (form_field._private.type === 'file')
                continue;

            form_field_values[form_field_name] = form_field.value;
        }

        return form_field_values;
    }},

    setDisabled: { value:
    function(disabled) {
        for (var field_name in this._private.formFields)
            this._private.formFields[field_name].setDisabled(disabled);
    }},

    setValidator: { value:
    function(validator) {
        for (var field_name in this._private.formFields)
            this._private.formFields[field_name].clearValidator();

        for (var field_name in validator.fields) {
            if (!(field_name in this._private.formFields)) {
                console.warn('No `eForm_Field` `' + field_name +
                        '` in layout.');
                continue;
            }

            this._private.formFields[field_name].setValidator(
                    validator.fields[field_name]);
        }
    }},

    setValues: { value:
    function(field_values) {
        for (var field_name in field_values) {
            if (!(field_name in this._private.formFields)) {
                // console.warn('No `eForm_Field` `' + field_name +
                //         '` in layout.');
                continue;
            }

            this._private.formFields[field_name].value =
                    field_values[field_name];
        }
    }}

}),

    parseNodes: function(form_layout)
    {
        var self = this;
        form_layout.onNodeCreated(function(node) {
            var html_elem = node.getHtmlElem();
            if (html_elem.tagName !== 'E-FORM-FIELD')
                return;

            var field_module = SPK.$abForms_Field.create(self, html_elem);

            self.formFields[field_module.name] = field_module;

            node.setModule(field_module);
        });
    }

}]);
