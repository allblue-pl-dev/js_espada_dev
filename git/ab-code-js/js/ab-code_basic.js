'use strict';


var abCode_Basic = function(abCode) {

    // abCode.addTag({
    //     name: 'test',
    //     attrs: [ 'red', 'blue', 'green' ],
    //     strip: true,
    //     start: function(tag) {
    //         return '#start<br />'
    //     },
    //     end: function(tag) {
    //         return 'end#'
    //     },
    //     parse: function(tag, line) {
    //         var new_line = '';
    //
    //         new_line += '<b>attrs: </b><br />';
    //         for (var attr_name in tag.attrs) {
    //             new_line += attr_name + ' = ' + tag.attrs[attr_name] + '<br />'
    //         }
    //
    //         new_line += '<b>stripped:</b> ' + line.stripped + '<br />';
    //
    //         new_line += '<b>line:</b> ' + line.content;
    //
    //         return new_line;
    //     }
    // });

    /* Helpers */
    function simple(tag_name, html_tag_name) {
        return {
            name: tag_name,
            parse: function(tag, line) {
                return '<' + html_tag_name + '>' + line.content +
                        '</' + html_tag_name + '>';
            },
        };
    }

    function simple_stripped(tag_name, html_tag_name) {
        return {
            name: tag_name,
            strip: true,
            start: function(tag) {
                return '<' + tag_name + '>';
            },
            end: function(tag) {
                return '</' + tag_name + '>';
            },
            parse: function(tag, line) {
                return line.content;
            },
        };
    }

    function span(tag_name, style) {
        return {
            name: tag_name,
            parse: function(tag, line) {
                return '<span style="' + style + '">' + line.content +
                        '</span>';
            },
        };
    }

    /* Tags */
    /* Simple */
    abCode.addTag(simple('b', 'strong'));
    abCode.addTag(simple('u', 'u'));
    abCode.addTag(simple('i', 'i'));
    abCode.addTag(span('o', 'text-decoration: line-through;'));

    /*  Headers */
    for (var i = 1; i <= 5; i++)
        abCode.addTag(simple('h' + i, 'h' + (i + 1)));

    /* Span */
    abCode.addTag({
        name: 'span',
        attrs: [ 'b', 'u', 'i', 'color', 'size'],
        parse: function(tag, line) {
            var style = '';
            if ('b' in tag.attrs)
                style += 'font-weight: bold;';
            if ('u' in tag.attrs)
                style += 'text-decoration: underline;';
            if ('i' in tag.attrs)
                style += 'font-style: italic;';

            if (tag.attrs.color)
                style += 'color: ' + tag.attrs.color + ';';
            if (tag.attrs.size)
                style += 'font-size: ' + tag.attrs.size + 'px;';

            return '<span style="' + style + '">' + line.content + '</span>';
        }
    });

    /* BR */
    abCode.addTag({
        name: 'br',
        strip: true,
        parse: function(tag, line) {
            return '<br />';
        }
    });

    /* Fa Icons */
    abCode.addTag({
        name: 'fa',
        parse: function(tag, line) {
            return '<i class="fa ' + line.content + '"></i>';
        }
    });

    /* Image */
    abCode.addTag({
        name: 'img',
        attrs: [ 'alt' ],
        parse: function(tag, line) {
            return '<img src="' + line.content + '" />';
        }
    });

    /* Html */
    abCode.addTag({
        name: 'html',
        strip: true,
        parse: function(tag, line) {
            return ABCode.Html_Unescape(line.content);
        }
    });

    /* List */
    abCode.addTag({
        name: 'list',
        strip: true,
        start: function(tag) {
            if ('ordered' in tag.attrs)
                return '<ol>';
            else
                return '<ul>';
        },
        end: function(tag) {
            if ('ordered' in tag.attrs)
                return '</ol>';
            else
                return '</ul>';
        },
        parse: function(tag, line) {
            return '<li>' + line.content + '</li>';
        }
    });

    /* Table */
    abCode.addTag({
        name: 'table',
        strip: true,
        start: function(tag) {
            return '<table>';
        },
        end: function(tag) {
            return '</table>';
        },
        parse: function(tag, line) {
            return '<tr>' + line.content + '</tr>';
        }
    });
    abCode.addTag(simple_stripped('th', 'th'));
    abCode.addTag(simple_stripped('td', 'td'));

    /* Url */
    abCode.addTag({
        name: 'url',
        strip: true,
        parse: function(tag, line) {
            var href = null;

            if (tag.attrs.href)
                href = tag.attrs.href;
            else
                href = line.content;

            if (href.charAt(0) !== '/' && href.indexOf('http://') !== 0 &&
                    href.indexOf('https://') !== 0)
                href = 'http://' + href;

            return '<a href="' + href + '">' + line.content + '</a>';
        }
    });
};
