'use strict';


SPK.Module('abNotifications', ['{{name}}'],
[function() {
    var self = this;
    this.$public = new this.Public.Class(this);

    this.createElems();

    this.$view = this.$layout;
}, {

    createElems: function()
    {
        var self = this;

        this.$elems.notification.addEventListener('click', function() {
            self.$public.hideMessage();
        });

        this.$elems.yes.addEventListener('click', function(evt) {
            evt.preventDefault();
            self.$public.hideConfirmation(true);
        });

        this.$elems.no.addEventListener('click', function(evt) {
            evt.preventDefault();
            self.$public.hideConfirmation(false);
        });
    },

$: {

    _Images: {
        loading: null,
        success: null,
        failure: null
    },

    SetImages: function(image_uris)
    {
        for (var image_name in image_uris) {
            if (!(image_name in this._Images))
                throw new Error('Image `' + image_name + ' does not exist.');

            this._Images[image_name] = image_uris[image_name];
        }
    }

},

Public: {
    _LoadingImage: '',

    // _private: null,
    _fields: null,
    _enabled: true,

    _message_Fn: null,

    Class: function(module)
    {
        var self = this.self = this;

        // this._private = module;
        this._fields = module.$fields;

        this._fields.set({
            confirmation: {
                show: false,
                text: '',
                yes: '',
                no: ''
            },
            loading: {
                show: false,
                image: SPK.$abNotifications._Images['loading'],
                text: ''
            },
            message: {
                show: false,
                image: '',
                text: ''
            }
        });
    },

    isEnabled: function()
    {
        var self = this.self;

        return self._enabled;
    },

    showConfirmation: function(text, yes_text, no_text, fn)
    {
        this._fields.confirmation.set({
            text: text,
            yes: yes_text,
            no: no_text,
            fn: fn,
            show: true
        });
    },

    showMessage: function(image_src, text, fn)
    {
        var self = this.self;

        self._message_Fn = typeof fn === 'undefined' ? null : fn;

        self._enabled = false;

        self._fields.message.set({
            image: image_src,
            text: text,
            show: true
        });
    },

    showMessage_Success: function(text, fn)
    {
        this.showMessage(SPK.$abNotifications._Images['success'], text, fn);
    },

    showMessage_Failure: function(text, fn)
    {
        this.showMessage(SPK.$abNotifications._Images['failure'], text, fn);
    },

    hideConfirmation: function(result)
    {
        var fn = this._fields.confirmation.fn;

        this._fields.confirmation.set({
            text: '',
            yes: '',
            no: '',
            fn: null,
            show: false
        });

        fn(result);
    },

    hideMessage: function()
    {
        var self = this.self;

        if (!self._fields.loading.show)
            self._enabled = true;

        self._fields.message.set({
            image: '',
            text: '',
            show: false
        });

        if (self._message_Fn !== null) {
            self._message_Fn();
            self._message_Fn = null;
        }
    },

    startLoading: function(text)
    {
        var self = this.self;

        self._enabled = true;

        self._fields.loading.set({
            text: text,
            show: true
        });
    },

    finishLoading: function()
    {
        var self = this.self;

        if (!self._fields.message.show)
            self._enabled = true;

        self._fields.loading.set({
            text: '',
            show: false
        });
    }

}}, function(module_prototype) {
    module_prototype.Public.Class.prototype = module_prototype.Public;
}]);
