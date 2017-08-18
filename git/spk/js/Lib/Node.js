'use strict';


var Node = {
    self: null,

    Create: function(layout, base, parent, node_index, repeat_keys_stack)
    {
        var node_info = layout.getNodeInfo(node_index);

        if ('repeat' in node_info) {
            return new RepeatNode.Class(layout, base, parent, node_index,
                    repeat_keys_stack);
        } else {
            return new HtmlNode.Class(layout, base, parent, node_index,
                    repeat_keys_stack);
        }
    },


    _parent: null,
    _parentHtmlNode: null,

    _htmlNode: null,

    __fields: null,

    __attrPartInfos: null,
    __fieldInfos: null,

    __Class: function(layout, base, parent)
    {
        this.self = this;

        this._base = base === null ? this : base;
        this._parent = parent;
        this.__fields = layout.getFields();
    },

    activate: function(parent_html_node)
    {
        var self = this.self;

        self._parentHtmlNode = parent_html_node;
        self.__activate();
    },

    deactivate: function(parent_html_node)
    {
        var self = this.self;

        self.__deactivate();
        self._parentHtmlNode = null;
    },

    getBase: function()
    {
        var self = this.self;

        return self._base;
    },

    getParent: function()
    {
        var self = this.self;

        return self._parent;
    },

    getParentHtmlNode: function()
    {
        var self = this.self;

        return self._parentHtmlNode;
    },

    isActive: function()
    {
        return this._parentHtmlNode !== null;
    },

    update: function(update_type)
    {
        if (update_type === LayoutField.Node_Type_Repeat)
            this.update_Repeat();
        else if (update_type === LayoutField.Node_Type_Field)
            this.update_Field();
        else if (update_type === LayoutField.Node_Type_Hide)
            this.update_Hide();
        else if (update_type === LayoutField.Node_Type_Show)
            this.update_Show();
    },

    __createField: function(update_key, update_type,
            node_info, repeat_keys_stack, value, virtual)
    {
        if (!(update_key in node_info))
            return;

        if (this.__fieldInfos === null)
            this.__fieldInfos = {};

        var field_info = node_info[update_key];

        field_info = this.__parseFieldInfo(field_info, repeat_keys_stack);

        if (field_info === null)
            return;

        this.__fieldInfos[update_key] = field_info;

        var field_name = field_info[LayoutField.Info_Index_Name];

        var field;
        if (this.__fields.exists(field_name))
            field = this.__fields.get(field_name);
        else
            field = this.__fields.create(field_name, value);

        /**
         * If node is virtual don't add fields node dependency add
         * don't update node.
         */
        if (virtual)
            return;

        field.addNode(this, update_type);

        this.update(update_type);
    },

    __createAttrFields: function(node_info, repeat_keys_stack, virtual)
    {
        if (!('fieldAttrs' in node_info))
            return;

        if (this.__attrPartInfos === null)
            this.__attrPartInfos = {};

        for (var attr_name in node_info.fieldAttrs) {
            var attr_part_infos = node_info.fieldAttrs[attr_name];

            this.__attrPartInfos[attr_name] = [];

            for (var i = 0; i < attr_part_infos.length; i++) {
                var attr_part_info = attr_part_infos[i];
                var attr_part_type =
                        attr_part_info[HtmlNode.AttrPart_Index_Type];
                var attr_part_value =
                        attr_part_info[HtmlNode.AttrPart_Index_Value];

                if (attr_part_type === HtmlNode.AttrPart_Type_Var) {
                    this.__attrPartInfos[attr_name].push([
                        HtmlNode.AttrPart_Type_Var,
                        attr_part_value
                    ]);
                    continue;
                }

                var field_info = this.__parseFieldInfo(attr_part_value,
                        repeat_keys_stack);

                if (field_info === null)
                    return;

                this.__attrPartInfos[attr_name].push([
                    HtmlNode.AttrPart_Type_Field,
                    field_info
                ]);

                var field_name = field_info[LayoutField.Info_Index_Name];

                var field;
                if (this.__fields.exists(field_name))
                    field = this.__fields.get(field_name);
                else
                    field = this.__fields.create(field_name, null);

                if (!virtual)
                    field.addNodeAttr(this, attr_name);
            }

            if (!virtual)
                this.updateAttr(attr_name);
        }

        // for (var attr_name in node_info.fieldAttrs)
        //     self.update_Attr(attr_name);
    },

    __parseFieldInfo: function(field_info, repeat_keys_stack)
    {
        var p_field_info = [];

        var field_name = field_info[LayoutField.Info_Index_Name];
        for (var i = 0; i < repeat_keys_stack.length; i++) {
            field_name = field_name.replace('.*', '.' + repeat_keys_stack[i]);
            field_name = field_name.replace('.#', '.' + repeat_keys_stack[i]);
        }

        if (field_name.match(/\.(\*|#)(\.|$)/))
            return null;

        p_field_info.push(field_name);

        if (field_info.length > 1) {
            var field_args = this._parseFieldInfo_Args(
                    field_info[LayoutField.Info_Index_Args],
                    repeat_keys_stack);
            p_field_info.push(field_args);
        }

        return p_field_info;
    },

    _createAttrFields_Create: function(attr_name, field_info,
            repeat_keys_stack)
    {
        field_info = this.__parseFieldInfo(field_info, repeat_keys_stack);
        this.__fieldInfos[update_key] = field_info;

        var field_name = field_info[LayoutField.Info_Index_Name];

        var field;
        if (this.__fields.exists(field_name))
            field = this.__fields.get(field_name);
        else
            field = this.__fields.create(field_name, value);

        field.addNodeAttr(this, attr_name);
    },

    _parseFieldInfo_Args: function(arg_infos, repeat_keys_stack)
    {
        var arg_values = [];
        for (var i = 0; i < arg_infos.length; i++) {
            var arg_type = arg_infos[i][LayoutField.Arg_Index_Type];
            var arg_value = arg_infos[i][LayoutField.Arg_Index_Value];

            if (arg_type === LayoutField.Arg_Type_Var)
                arg_values.push([LayoutField.Arg_Type_Var, arg_value]);
            else if (arg_type === LayoutField.Arg_Type_Field) {
                arg_values.push([LayoutField.Arg_Type_Field,
                        this.__parseFieldInfo(arg_value,
                        repeat_keys_stack)]);
            }
        }

        return arg_values;
    },

    /* Virtual */
    addChild: function(node)
    {
        throw new Error('Not implemented.');
    },

    getChildren: function()
    {
        throw new Error('Not implemented.');
    },

    getFirstHtmlNode: function()
    {
        throw new Error('Not implemented.');
    },

    __activate: function()
    {
        throw new Error('Not implemented.');
    },

    __deactivate: function()
    {
        throw new Error('Not implemented.');
    }

};
Node.__Class.prototype = Node;
