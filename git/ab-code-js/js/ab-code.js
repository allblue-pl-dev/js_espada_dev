'use strict';


var ABCode = {

    Html_Escape: function(html) {
        return html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    Html_Unescape: function(text) {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, '\'');
    },


    tags: null,
    editor: null,

    Class: function(editor_elem)
    {
        this.editor = new ABCode_Editor.Class(editor_elem);
        this.tags = {};
    },

    addTag: function(tag_info)
    {
        var tag = {
            name: null,
            attrs: [],
            strip: false,
            start: function() {
                return '';
            },
            end: function() {
                return '';
            },
            parse: null,
            editor: function() {
                return {};
            }
        };

        for (var prop_name in tag_info) {
            if (prop_name === 'name')
                tag.name = tag_info.name;
            else if (prop_name === 'attrs')
                tag.attrs = tag_info.attrs;
            else if (prop_name === 'strip')
                tag.strip = tag_info.strip;
            else if (prop_name === 'start')
                tag.start = tag_info.start;
            else if (prop_name === 'end')
                tag.end = tag_info.end;
            else if (prop_name === 'parse')
                tag.parse = tag_info.parse;
            else if (prop_name === 'editor')
                tag.editor = tag_info.editor;
            else
                throw new Error('Unknown property `' + prop_name + '`.');
        }

        this.tags[tag.name] = tag;
    },

    getCode: function()
    {
        var code = '';
        var lines = this.editor.getLines();
        for (var i = 0; i < lines.length; i++) {
            if (i > 0)
                code += '\n';

            code += lines[i];
        }

        return code;
    },

    getHtml: function()
    {
        var lines = this.editor.getLines();
        var parser = new ABCode_Parser.Class(this.tags, lines);

        return parser.getHtml();
    },

    insert: function(code)
    {
        this.editor.insert(code);
    },

    setCode: function(code)
    {
        this.editor.setCode(code);
    }


    //
    // getCode: function()
    // {
    //     var code = '';
    //
    //     for (var i = 0; i < this.eEditor.childNodes.length; i++) {
    //         var e_line = this.eEditor.childNodes[i];
    //
    //         if (e_line.nodeType !== 1)
    //             continue;
    //         if (e_line.tagName !== 'P')
    //             continue;
    //         if (e_line.childNodes.length < 1)
    //             continue;
    //
    //         if (i > 0)
    //             code += '\n';
    //
    //         if (e_line.childNodes[0].nodeType !== 3)
    //             continue;
    //
    //         code += e_line.childNodes[0].data;
    //     }
    //
    //     return code;
    // },
    //
    // getHtml: function()
    // {
    //     var lines = this.getValidLineTexts();
    //     var parser = new ABCode_Parser.Class(this.tags, lines);
    //
    //     return parser.getHtml();
    // },
    //
    // getLineText: function(e_line)
    // {
    //     if (!this.isLineValid(e_line))
    //         throw new Error('Line is not valid.');
    //
    //     if (e_line.childNodes.length === 1)
    //         return '';
    //
    //     return e_line.childNodes[0].data;
    // },
    //
    // getValidLineTexts: function()
    // {
    //     /* Get editor lines. */
    //     var lines = [];
    //     for (var i = 0; i < this.eEditor.childNodes.length; i++) {
    //         if (!this.isLineValid(this.eEditor.childNodes[i]))
    //             continue;
    //
    //         lines.push(this.getLineText(this.eEditor.childNodes[i]));
    //     }
    //
    //     return lines;
    // },
    //

    //
    // isLineValid: function(e_line)
    // {
    //     if (e_line.nodeType !== 1)
    //         return false;
    //     if (e_line.tagName !== 'P')
    //         return false;
    //     if (e_line.childNodes.length < 1)
    //         return false;
    //
    //     return true;
    // },
    //
    // parse: function()
    // {
    //     if (this.eEditor.childNodes.length === 0) {
    //         this.addLine();
    //         return;
    //     }
    //
    //     var current_e_line_i = -1;
    //     for (var i = 0; i < this.eEditor.childNodes.length; i++) {
    //         var e_line = this.eEditor.childNodes[i];
    //
    //         if (e_line.tagName === 'P') {
    //             if (e_line.childNodes.length === 2) {
    //                 if (e_line.childNodes[0].nodeType === 3) {
    //                     if (e_line.childNodes[1].tagName === 'BR')
    //                         continue;
    //                 }
    //             }
    //
    //             e_line.innerHTML = e_line.innerHTML.replace(/<.*?>/gm, '');
    //             e_line.appendChild(document.createElement('BR'));
    //         }
    //     }
    // },
    //
    // setCode: function(code)
    // {
    //     this.clear();
    //
    //     var code_array = code.split('\n');
    //
    //     for (var i = 0; i < code_array.length; i++) {
    //         var e_line = document.createElement('P');
    //         e_line.appendChild(document.createTextNode(code_array[i]));
    //         e_line.appendChild(document.createElement('BR'));
    //         this.eEditor.appendChild(e_line);
    //     }
    // }

};
ABCode.Class.prototype = ABCode;
