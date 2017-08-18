'use strict';


var LayoutField = {

    Node_Type_Repeat:   1,
    Node_Type_Field:    2,
    Node_Type_Hide:     3,
    Node_Type_Show:     4,

    Arg_Index_Type:     0,
    Arg_Index_Value:    1,

    Arg_Type_Var:       0,
    Arg_Type_Field:     1,

    Info_Index_Name:    0,
    Info_Index_Args:    1,


    Class: function(root, parent, fields, name, value)
    {
        Field.Class.call(this, root, parent, fields, name, value);
        var self = this.self;

        // self._fieldInfos = [];
        // self._nodeInfos = [];
        // self._nodeAttrInfos = [];

        // self._update_Nodes();
    }

};
var extend = LayoutField.Class.prototype = Object.create(Field);

extend._fieldInfos = null;
extend._nodeInfos = null;
extend._nodeAttrInfos = null;

extend.addField = function(field_info)
{
    if (this._fieldInfos === null)
        this._fieldInfos = [];

    this._fieldInfos.push(field_info);
};

extend.addNode = function(node, type)
{
    if (this._nodeInfos === null)
        this._nodeInfos = [];

    this._nodeInfos.push({
        node: node,
        type: type
    });
};

extend.addNodeAttr = function(node, attr_name)
{
    var self = this.self;

    if (this._nodeAttrInfos === null)
        this._nodeAttrInfos = [];

    self._nodeAttrInfos.push({
        node: node,
        attr: attr_name
    });
};

extend.getValue = function(field_info)
{
    var field_name = field_info[LayoutField.Info_Index_Name];
    if (field_name[0] === '#') {
        return field_name.substring(1);
    }

    var field = this.get(field_name);

    if (field.isFunction()) {
        var fn = field.val();

        if (typeof field_info[LayoutField.Info_Index_Args] ===
                'undefined') {
            return {
                name: field.getName(),
                value: fn.call(null)
            };
        }

        var args = this._getFieldValue_Args(
                field_info[LayoutField.Info_Index_Args]);

        return {
            name: field.getName(),
            value: fn.apply(null, args)
        };
    }

    return field.getPublic();
};

// extend.getValue_FromArgs = function(arg_infos)
// {
//     var arg_values = [];
//     for (var i = 0; i < arg_infos.length; i++) {
//         var arg_type = arg_infos[i][HtmlNode._Update_Arg_Index_Type];
//         var arg_value = arg_infos[i][HtmlNode._Update_Arg_Index_Value];
//
//         if (arg_type === HtmlNode._Update_Arg_Type_Var)
//             arg_values.push(arg_value);
//         else if (arg_type === HtmlNode._Update_Arg_Type_Field) {
//             var root_field = this.getRoot();
//             var field_info = arg_value;
//             var field_name = field_info[HtmlNode._Update_FieldInfo_Index_Name];
//
//             arg_values.push(root_field, field_info);
//
//             if (!root_field.exists(field_name)) {
//                 arg_values.push(null);
//                 continue;
//             }
//
//             arg_values.push(root_field.get(field_name).val());
//         }
//     }
//
//     return arg_values;
// };

extend._getFieldValue_Args = function(arg_infos)
{
    var arg_values = [];
    for (var i = 0; i < arg_infos.length; i++) {
        var arg_type = arg_infos[i][LayoutField.Arg_Index_Type];
        var arg_value = arg_infos[i][LayoutField.Arg_Index_Value];

        if (arg_type === LayoutField.Arg_Type_Var)
            arg_values.push(arg_value);
        else if (arg_type === LayoutField.Arg_Type_Field) {
            var field_info = arg_value;
            var field_name = field_info[LayoutField.Info_Index_Name];

            if (!this.getRoot().exists(field_name)) {
                arg_values.push(null);
                continue;
            }

            arg_values.push(this.getRoot().get(field_name).getPublic());
        }
    }

    return arg_values;
};

extend._update_Fields = function()
{
    var self = this.self;

    if (this._fieldInfos === null)
        return;

    for (var i = 0; i < self._fieldInfos.length; i++) {
        var root = this.getRoot();
        var field_info = self._fieldInfos[i];

        if (root.exists(field_info[HtmlNode._Update_Info_Name]))
        self.getRoot().get().update();
    }
};

extend._update_Nodes = function()
{
    if (this._nodeInfos === null)
        return;

    for (var i = 0; i < this._nodeInfos.length; i++) {
        var node_info = this._nodeInfos[i];

        node_info.node.update(node_info.type)
    }
};

extend._update_NodeAttrs = function()
{
    if (this._nodeAttrInfos === null)
        return;

    for (var i = 0; i < this._nodeAttrInfos.length; i++) {
        var node_info = this._nodeAttrInfos[i];

        node_info.node.updateAttr(node_info.attr);
    }
};

/* Overrides */
extend.new = function(parent, fields, name, value, update)
{
    return new LayoutField.Class(parent, fields, name, value, update);
};

extend.update = function(field_name)
{
    var self = this.self;

    Field.update.call(this, field_name);

    self._update_Fields();
    self._update_Nodes();
    self._update_NodeAttrs();
};
