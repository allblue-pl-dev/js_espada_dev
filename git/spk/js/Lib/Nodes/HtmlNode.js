'use strict';


var HtmlNode = {

    AttrPart_Index_Type:    0,
    AttrPart_Index_Value:   1,

    AttrPart_Type_Var:      0,
    AttrPart_Type_Field:    1,

    Class: function(layout, base, parent, node_index, repeat_keys_stack)
    {
        Node.__Class.call(this, layout, base, parent);
        var self = this.self;

        this._layout = layout;

        self._children = [];

        var node_info = layout.getNodeInfo(node_index);
        self._htmlElem = NodeHelper.CreateHtmlNode(node_info);

        self._createFields(self.__fields, node_info, repeat_keys_stack);
        self._createElems(layout, node_info, repeat_keys_stack);
        self._createHolders(layout, node_info);

        if ('children' in node_info) {
            for (var i = 0; i < node_info.children.length; i++) {
                var node = Node.Create(layout, null, self,
                        node_info.children[i], repeat_keys_stack);

                self._children.push(node);
                node.activate(self._htmlElem);
            }
        }

        layout.addNode(this);
    }

};
var extend = HtmlNode.Class.prototype = Object.create(Node);

extend._layout = null;
extend._base = null;
extend._parent = null;
extend._children = null;
extend._htmlElem = null;

extend.__fields = null;

extend._visible = true;

/* Updates */
extend.__attrInfos = null;

/* Holder */
extend._activeLayout = null;
extend._activeModule = null;

extend.destroy = function()
{
    this._layout.removeNode(this);
};

extend.get = function()
{
    var self = this.self;

    return self._htmlElem;
};

extend.getHtmlElem = function()
{
    var self = this.self;

    return self._htmlElem;
};

extend.update_Field = function()
{
    var self = this.self;

    var value = this.__fields.getValue(self.__fieldInfos.field).value;

    /* nodeType 3 = TextNode */
    if (self._htmlElem.nodeType === 3)
        self._htmlElem.nodeValue = value;
    else
        self._htmlElem.innerHTML = value;
};

extend.update_Hide = function(value)
{
    var self = this.self;

    var value = this.__fields.getValue(self.__fieldInfos.hide).value;

    value = value ? false : true;

    self._update_Visibility(value);
};

extend.update_Show = function(value)
{
    var self = this.self;

    var value = this.__fields.getValue(self.__fieldInfos.show).value;

    value = value ? true : false;

    self._update_Visibility(value);
};

extend.updateAttr = function(attr_name)
{
    var self = this.self;

    var value = '';
    var value_set = false;

    var attr_part_infos = self.__attrPartInfos[attr_name];
    for (var i = 0; i < attr_part_infos.length; i++) {
        var attr_part_info = attr_part_infos[i];

        var attr_part_type =
                attr_part_info[HtmlNode.AttrPart_Index_Type];
        var attr_part_value =
                attr_part_info[HtmlNode.AttrPart_Index_Value];

        if (attr_part_type === HtmlNode.AttrPart_Type_Var) {
            value += attr_part_value;
            value_set = true;
        } else if (attr_part_type === HtmlNode.AttrPart_Type_Field) {
            var field_value = this.__fields.getValue(attr_part_value).value;

            if (field_value === null)
                continue;

            value += field_value;
            value_set  =true;
        }
    }

    if (!value_set)
        self._htmlElem.removeAttribute(attr_name);
    else
        self._htmlElem.setAttribute(attr_name, value);
};

extend._createElems = function(layout, node_info, repeat_keys_stack)
{
    var self = this.self;

    if (!('elem' in node_info))
        return;

    var elem_info = node_info.elem;

    var p_elem_info = [elem_info[Elem.Info_Index_Name]];

    if (typeof elem_info[Elem.Info_Index_Args] !== 'undefined') {
        var elem_args = elem_info[Elem.Info_Index_Args];
        var p_arg_infos = [];

        for (var i = 0; i < elem_args.length; i++) {
            p_arg_infos.push(this.__parseFieldInfo(elem_args[i],
                    repeat_keys_stack));
        }

        p_elem_info.push(p_arg_infos);
    }

    var elem = layout.getElems().get(p_elem_info);

    elem.add(self, p_elem_info);
};

extend._createFields = function(fields, node_info, repeat_keys_stack)
{
    var self = this.self;

    self.__createField('field', LayoutField.Node_Type_Field,
            node_info, repeat_keys_stack, null, false);

    self.__createField('show', LayoutField.Node_Type_Show,
            node_info, repeat_keys_stack, null, false);

    self.__createField('hide', LayoutField.Node_Type_Hide,
            node_info, repeat_keys_stack, null, false);

    self.__createAttrFields(node_info, repeat_keys_stack, false);
};

extend._createHolders = function(layout, node_info)
{
    var self = this.self;

    if (!('holder' in node_info))
        return;

    var holders = layout.getHolders();

    holders[node_info.holder] = new Holder.Class(layout.getApp(),
            self._htmlElem);

    Object.defineProperties(holders[node_info.holder], {
        $view: {
        set: function(value) {
            if (value === null) {
                this.setLayout(null);
                return;
            }

            var prototype = Object.getPrototypeOf(value.private);

            if (prototype === Layout)
                this.setLayout(value);
            else if (prototype === Module)
                this.setModule(value);
            else
                this.setModule(value.private);
        }}
    });
};

extend._update_Visibility = function(value)
{
    var self = this.self;

    if (self._visible === value)
        return;
    self._visible = value;

    if (!self.isActive())
        return;

    if (self._visible)
        NodeHelper.ParentHtmlNode_Push(self, self._htmlElem);
    else
        NodeHelper.ParentHtmlNode_Pop(self, self._htmlElem);
};

/* Holder */
extend.setLayout = function(layout)
{
    var self = this.self;

    layout = layout.private;

    self._deactivate();

    layout.activate(self._htmlElem);

    self._activeLayout = layout;
};

extend.setModule = function(module)
{
    var self = this.self;

    module = module.private.private;

    self._deactivate();

    module.activate(self._htmlElem);

    self._activeModule = module;
};

extend._deactivate = function()
{
    var self = this.self;

    if (self._activeLayout !== null) {
        self._activeLayout.deactivate(self._htmlElem);
        self._activeLayout = null;
        return;
    }

    if (self._activeModule !== null) {
        self._activeModule.deactivate(self._htmlElem);
        self._activeModule = null;
        return;
    }

    /* Should also deactivate children (after checking if they're active). */
};

/* Overrides */
extend.getChildren = function()
{
    var self = this.self;

    return self._children;
}

extend.getFirstHtmlNode = function()
{
    var self = this.self;

    if (!this._visible)
        return null;

    if (self.isActive())
        return self._htmlElem;

    return null;
};

extend.__activate = function()
{
    var self = this.self;

    if (self._visible)
        NodeHelper.ParentHtmlNode_Push(self, self._htmlElem);
};

extend.__deactivate = function()
{
    var self = this.self;

    if (self._visible)
        NodeHelper.ParentHtmlNode_Pop(self, self._htmlElem);
};
