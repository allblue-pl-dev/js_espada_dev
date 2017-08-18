'use strict';


var Holder = {
    self: null,

    _app: null,
    _htmlElem: null,

    _activeLayout: null,
    _activeModule: null,

    Class: function(app, html_elem)
    {
        var self = this.self = this;

        self._app = app;
        self._htmlElem = html_elem;
    },

    createLayout: function(layout_name)
    {
        var layout = this._app.createLayout(layout_name).getPublic();

        this.setLayout(layout);

        return layout;
    },

    setLayout: function(layout)
    {
        var self = this.self;

        self._deactivate();
        self._activeLayout = layout;

        if (layout === null)
            return;

        layout = layout.private;

        if (self._htmlElem !== null)
            layout.activate(self._htmlElem);
    },

    setModule: function(module)
    {
        var self = this.self;

        self._deactivate();

        if (self._htmlElem !== null)
            module.private.activate(self._htmlElem);

        self._activeModule = module.private;
    },

    _deactivate: function()
    {
        var self = this.self;

        if (self._activeLayout !== null) {
            self._activeLayout.private.deactivate(self._htmlElem);
            self._activeLayout = null;
            return;
        }

        if (self._activeModule !== null) {
            self._activeModule.deactivate(self._htmlElem);
            self._activeModule = null;
            return;
        }
    }

};
Holder.Class.prototype = Holder;
