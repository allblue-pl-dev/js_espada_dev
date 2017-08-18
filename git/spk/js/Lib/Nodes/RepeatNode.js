'use strict';


var RepeatNode = {

    Class: function(layout, base, parent, node_index, repeat_keys_stack)
    {
        Node.__Class.call(this, layout, base, parent);
        var self = this.self;

        self._layout = layout;
        self._nodeIndex = node_index;
        self._repeatKeyStack = repeat_keys_stack;

        self._children = [];
        self._items = [];

        var node_info = layout.getNodeInfo(node_index);

        self._createFields(layout, node_info, repeat_keys_stack, false);
        self._createElems(layout, node_info);

        // if ('children' in node_info) {
        //     for (var i = 0; i < node_info.children.length; i++) {
        //         var node = Node.Create(layout, null, self,
        //                 node_info.children[i], repeat_keys_stack);
        //
        //         self._children.push(node);
        //         node.activate(self._htmlNode);
        //
        //         break;
        //     }
        // }
    }

};
var extend = RepeatNode.Class.prototype = Object.create(Node);

extend._layout = null;
extend._nodeIndex = null;
extend._repeatKeyStack = null;

extend._children = null;
extend._items = null;

extend.update_Repeat = function()
{
    var self = this.self;

    var value = this.__fields.getValue(this.__fieldInfos.repeat);
    // console.log('Repeat', value, this.__fields.get('list.0').getPublic());

    var keys;
    if (value === null)
        keys = [];
    else
        keys = Object.keys(value);

    // console.log('Repeat:', value, self._items.length, keys.length);

    while (self._items.length < keys.length)
        self._addItem(self._items.length);

    while (self._items.length > keys.length)
        self._removeItem();
};

extend._addItem = function(repeat_key)
{
    var self = this.self;

    var repeat_keys_stack = self._repeatKeyStack.slice();
    repeat_keys_stack.push(repeat_key);

    var item = new HtmlNode.Class(self._layout,
            self, self.getParent(), self._nodeIndex, repeat_keys_stack);
    self._items.push(item);

    if (self.isActive())
        item.activate(self.getParentHtmlNode());
};

extend._createElems = function(layout, node_info)
{
    var self = this.self;

    if ('elem' in node_info)
        layout.getElems().create(node_info.elem);

    if (!('children' in node_info))
        return;

    for (var i = 0; i < node_info.children.length; i++)
        self._createElems(layout, layout.getNodeInfo(node_info.children[i]));
};

extend._createFields = function(layout, node_info, repeat_keys_stack,
        virtual)
{
    var self = this.self;

    self.__createField('repeat', LayoutField.Node_Type_Repeat,
            node_info, repeat_keys_stack, [], virtual);

    self.__createField('field', LayoutField.Node_Type_Field,
            node_info, repeat_keys_stack, null, true);

    self.__createField('show', LayoutField.Node_Type_Show,
            node_info, repeat_keys_stack, null, true);

    self.__createField('hide', LayoutField.Node_Type_Hide,
            node_info, repeat_keys_stack, null, true);

    self.__createAttrFields(node_info, repeat_keys_stack, true);

    if (!('children' in node_info))
        return;

    for (var i = 0; i < node_info.children.length; i++) {
        self._createFields(layout, layout.getNodeInfo(node_info.children[i]),
                repeat_keys_stack, true);
    }
};

extend._removeItem = function()
{
    var self = this.self;

    var item = self._items.pop();
    if (self.isActive()) {
        item.deactivate(self.getParentHtmlNode());
        item.destroy();
    }
};

/* Overrides */
extend.createChild = function(node_info)
{
    var self = this.self;

    var node = new RepeatNode_Item.Class(parent, fields, node_info);

    self._children.push(node);
};

extend.getChildren = function()
{
    var self = this.self;

    return self._items;
};

extend.getFirstHtmlNode = function()
{
    var self = this.self;

    var html_node
    for (var i = 0; i < self._items.length; i++) {
        html_node = self._items[i].getFirstHtmlNode();
        if (html_node !== null)
            return html_node;
    }

    return null;
};

extend.__activate = function()
{
    var self = this.self;

    for (var i = 0; i < self._items.length; i++)
        self._items[i].activate(self.getParentHtmlNode());
};

extend.__deactivate = function()
{
    var self = this.self;

    for (var i = 0; i < self._items.length; i++)
        self._items[i].deactivate(self.getParentHtmlNode());
};
