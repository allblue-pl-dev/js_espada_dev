'use strict';

SPK

.Module('abFileInput', ['{{name}}'], [
function(button, extensions, fn) {
    this.$fields.extensions = extensions;

    this.createElems(button, fn);

    this.$view = this.$layout;
}, {

    createElems: function(button, fn)
    {
        var file_input = this.$elems.fileInput;

        var file_input_listener = function() {
            fn(this.files);

            var new_file_input = document.createElement('input');

            new_file_input.type = 'file';
            new_file_input.id = file_input.id;
            new_file_input.accept = file_input.accept;
            new_file_input.className = file_input.className;
            new_file_input.setAttribute('style',
                    file_input.getAttribute('style'));
            if ('multiple' in file_input)
                new_file_input.multiple = 'true';

            new_file_input.addEventListener('change', file_input_listener);

            file_input.parentNode.replaceChild(new_file_input, file_input);
            file_input = new_file_input;
        };

        file_input.addEventListener('change', file_input_listener);

        button.addEventListener('click', function(evt) {
            evt.preventDefault();

            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            file_input.dispatchEvent(event);
            // var event = new MouseEvent('click', {
            //     view: window,
            //     bubbles: true,
            //     cancelable: true
            // });
        });
    }

}]);
