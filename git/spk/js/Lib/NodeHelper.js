'use strict';


var NodeHelper = {

    CreateHtmlNode: function(node_info)
    {
        var html_node;

        if (node_info.type === '_text')
            html_node = document.createTextNode(node_info.val);
        // else if (node_info.type === '_comment')
        //     self._baseHtmlNodes = [document.createComment(node_info.val)];
        else {
            html_node = document.createElement(node_info.type);

            for (var attr_name in node_info.attrs) {
                html_node.setAttribute(attr_name,
                        node_info.attrs[attr_name]);
            }
        }

        return html_node;
    },

    ParentHtmlNode_Push: function(node, html_node)
    {
        var node_base = node.getBase();

        var parent_html_node = node.getParentHtmlNode();
        var siblings = node_base.getParent().getChildren();
        var siblings_index = siblings.indexOf(node_base);

        var next_html_node = null;
        for (var i = siblings_index + 1; i < siblings.length; i++) {
            next_html_node = siblings[i].getFirstHtmlNode();
            if (next_html_node !== null)
                break;
        }

        if (next_html_node === null)
            parent_html_node.appendChild(html_node);
        else
            parent_html_node.insertBefore(html_node, next_html_node);
    },

    ParentHtmlNode_Pop: function(node, html_node)
    {
        if (node.getParentHtmlNode() !== null)
            node.getParentHtmlNode().removeChild(html_node);
    }

};
