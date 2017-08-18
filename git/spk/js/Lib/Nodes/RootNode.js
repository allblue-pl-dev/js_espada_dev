'use strict';


var RootNode = {

    Class: function(layout)
    {
        Node.__Class.call(this, layout, null, null);
        var self = this.self;

        self._children = [];
    }

};
var extend = RootNode.Class.prototype = Object.create(Node);

self._children = null;

/* Overrides */
extend.addChild = function(node)
{
    var self = this.self;

    self._children.push(node);
    if (self.isActive())
        node.activate(self.getParentHtmlNode());
};

extend.getChildren = function()
{
    var self = this.self;

    return self._children;
};

extend.__activate = function()
{
    var self = this.self;

    for (var i = 0; i < self._children.length; i++)
        self._children[i].activate(self.getParentHtmlNode());
};

extend.__deactivate = function()
{
    var self = this.self;

    for (var i = 0; i < self._children.length; i++)
        self._children[i].deactivate(self.getParentHtmlNode());
};
