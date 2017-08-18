'use strict';


var ABCode_Editor = {

    eEditor: null,
    eEditor_Focused: false,
    eEditor_BlurCancelled: false,

    Class: function(editor_elem)
    {
        this.eEditor = editor_elem;

        this.initialize();
    },

    caretPosition_Get: function()
    {
        if (!this.eEditor_Focused)
            return null;

        return this.eEditor.selectionStart;
    },

    caretPosition_Set: function(caret_position)
    {
        this.eEditor.selectionStart = caret_position;
    },

    clear: function()
    {
        this.eEditor.value = '';
    },

    getLines: function()
    {
        return this.eEditor.value.replace(/\r/gm, '').split('\n');
    },

    initialize: function()
    {
        var self = this;

        this.eEditor.setAttribute('contenteditable', 'true');
        this.eEditor.setAttribute('style',
            'overflow-x: hidden;' +
            'overflow-y: scroll;'
        );
        this.eEditor.addEventListener('focus', function() {
            self.eEditor_Focused = true;
            self.eEditor_BlurCancelled = true;
        });
        this.eEditor.addEventListener('blur', function() {
            self.eEditor_BlurCancelled = false;
            setTimeout(function() {
                if (self.eEditor_BlurCancelled)
                    return;
                self.eEditor_Focused = false;
            }, 500);
        });
    },

    insert: function(code)
    {
        var caret_position = this.caretPosition_Get();
        if (caret_position === null) {
            caret_position = this.eEditor.value.length;
            code = '\n' + code;
        }

        this.eEditor.value = this.eEditor.value.substring(0, caret_position) +
                code + this.eEditor.value.substring(caret_position);
        this.caretPosition_Set(caret_position + code.length);
    },

    setCode: function(code)
    {
        this.eEditor.value = code;
    }

};
ABCode_Editor.Class.prototype = ABCode_Editor;
