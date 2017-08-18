'use strict';


SPK.Ext([], function(app) {
    app.module(function(module) {
        console.log(module);
        module.layouts.forEach(function(layout) {
            var as = layout.rootElem.getElementsByTagName('A');
            as.forEach(function(a) {
                if (a.hasAttribute('abf-link')) {
                    a.addEventListener('click', function(event) {
                        event.preventDefault();
                        app.page = a.getAttribute('abf-link');
                    });
                }
            });
        });
    });
});
