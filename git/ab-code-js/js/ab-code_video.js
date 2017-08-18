'use strict';

var abCode_Video = function(abCode) {

    var yt_html =
        '<div class="ab-code video youtube">' +
            '<iframe width="770" height="480"' +
                    ' src="https://www.youtube.com/embed/{{id}}"' +
                    ' frameborder="0" allowfullscreen>' +
            '</iframe>' +
        '</div>';
    var yt_regexp = /youtube\.com\/watch\?v=([^&]*)/;

    var vimeo_html =
        '<div class="ab-code video vimeo">' +
            '<iframe src="https://player.vimeo.com/video/{{id}}?title=0&portrait=0"' +
                    ' width="770" height="433" frameborder="0"' +
                    ' webkitallowfullscreen mozallowfullscreen' +
                    ' allowfullscreen>' +
            '</iframe>' +
        '</div>';
    var vimeo_regexp = /vimeo\.com\/([^\/]*)/;

    var facebook_html =
        '<div class="ab-code video facebook">' +
            '<iframe src="https://www.facebook.com/plugins/video.php?href={{href}}' +
                    '&width=770&show_text=false' +
                    '&height=433" width="770" height="433"' +
                    ' style="border:none;overflow:hidden" scrolling="no"' +
                    ' frameborder="0" allowTransparency="true">' +
            '</iframe>' +
        '</div>';
    var facebook_regexp = /facebook\.com\/(.*?)\/videos\/(.*)/;

    abCode.addTag({
        name: 'video',
        strip: true,
        parse: function(tag, line) {
            var match;

            match = yt_regexp.exec(line.content);
            if (match !== null)
                return yt_html.replace('{{id}}', match[1]);

            match = vimeo_regexp.exec(line.content);
            if (match !== null)
                return vimeo_html.replace('{{id}}', match[1]);

            match = facebook_regexp.exec(line.content);
            if (match !== null)
                return facebook_html.replace('{{href}}', encodeURIComponent(line.content));

            return '<strong>Nieznany format video.</strong>';
        }
    });

};
