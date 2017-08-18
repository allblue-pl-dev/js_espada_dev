'use strict';


var Layout = {
    self: null,

    _type: 'layout',

    _app: null,

    _elems: null,
    _fields: null,
    _holders: null,

    _rootNode: null,
    _nodeInfo: null,

    _nodes: null,
    _listeners_OnNodeCreated: null,

    Class: function(app, layout_info)
    {
        var self = this.self = this;

        self._app = app;

        self._fields = new LayoutField.Class(null, {}, '$', {});
        self._elems = new Elems.Class(this._fields);
        self._holders = {};

        self._rootNode = new RootNode.Class(this);
        self._nodeInfos = layout_info.nodes;

        this._public = new Layout.Public.Class(this);

        this._nodes = [];
        this._listeners_OnNodeCreated = [];

        self._createNodes(layout_info);
    },

    activate: function(root_html_node)
    {
        var self = this.self;

        self._rootNode.activate(root_html_node);
    },

    addEventListener_OnNodeCreated: function(fn)
    {
        this._listeners_OnNodeCreated.push(fn);

        for (var i = 0; i < this._nodes.length; i++)
            fn(this._nodes[i]);
    },

    addNode: function(node)
    {
        this._nodes.push(node);
        for (var i = 0; i < this._listeners_OnNodeCreated.length; i++)
            this._listeners_OnNodeCreated[i](node);
    },

    deactivate: function(root_html_node)
    {
        var self = this.self;

        self._rootNode.deactivate(root_html_node);
    },

    getApp: function()
    {
        var self = this.self;

        return self._app;
    },

    getElems: function()
    {
        var self = this.self;

        return self._elems;
    },

    getFields: function()
    {
        var self = this.self;

        return self._fields;
    },

    getHolders: function()
    {
        var self = this.self;

        return self._holders;
    },

    getNodeInfo: function(node_index)
    {
        var self = this.self;

        return self._nodeInfos[node_index]
    },

    getPublic: function()
    {
        var self = this.self;

        return self._public;
    },

    removeNode: function(node)
    {
        var node_index = this._nodes.indexOf(node);

        if (node_index === -1)
            return;

        this._nodes.splice(node_index, 1);
    },

    trigger_OnNodeCreated: function(node)
    {
        for (var i = 0; i < self._listeners_OnNodeCreated.length; i++)
            self._listeners_OnNodeCreated[i](node);
    },

    _createNodes: function(layout_info)
    {
        var self = this.self;

        var nodes = [];
        var repeat_keys_stack = [];

        for (var i = 0; i < layout_info.nodes.length; i++) {
            var node_info = layout_info.nodes[i];

            if (node_info.parent !== -1)
                continue;

            var node = Node.Create(self, null, self._rootNode, i,
                    repeat_keys_stack);
            self._rootNode.addChild(node);
        }
    },

    Public: Object.create(null, {
        Class: { value:
        function(layout) {
            Object.defineProperties(this, {
                private: { value: layout }
            });
        }},

        $elems: {
        get: function() {
            return this.private._elems.getPublic();
        }},

        $fields: {
        get: function() {
            return this.private._fields.getPublic();
        }},

        $holders: {
        get: function() {
            return this.private._holders;
        }},

        onNodeCreated: { value:
        function(fn) {
            this.private.addEventListener_OnNodeCreated(fn);
        }}

    })

};
Layout.Class.prototype = Layout;
Layout.Public.Class.prototype = Layout.Public;
