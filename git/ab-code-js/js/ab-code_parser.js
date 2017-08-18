'use strict';


var ABCode_Parser = {

    Regexps_OpenTag: '\\[ *{{tagName}}(.*?)\\]',
    Regexps_CloseTag: '\\[ */ *{{tagName}} *\\]',


    tags: null,
    lines: null,

    Class: function(tags, lines)
    {
        this.tags = tags;
        this.lines = [];

        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length >= 2) {
                if (lines[i].charAt(0) === '/' && lines[i].charAt(1) === '/')
                    continue;
            }

            if (i > 0) {
                if (lines[i].length === 0 && lines[i - 1].length === 0)
                    lines[i] = '[br] [/br]';
            }

            this.lines.push(ABCode.Html_Escape(lines[i]));
        }
    },

    getHtml: function()
    {
        var tag_matches = this.getTagMatches(this.lines);
        var html = this.parseHtml(tag_matches);

        return html;
    },

    getTagMatches: function(lines)
    {
        var tag_matches = [];
        for (var tag_name in this.tags) {
            var r_matches = this.getTagMatches_Matches(lines, tag_name);

            var r_matches_open_i = 0;
            var r_matches_close_i = 0;

            var opened_matches = [];
            while (true) {
                if (r_matches_close_i >= r_matches.close.length)
                    break;

                var open_match = r_matches_open_i < r_matches.open.length ?
                        r_matches.open[r_matches_open_i] : null;
                var close_match = r_matches.close[r_matches_close_i];

                var is_next_match_open = this.getTagMatches_IsFirst(
                        open_match, close_match);

                /* If next match is open, just add it to opened matches. */
                if (is_next_match_open) {
                    opened_matches.push(open_match);
                    r_matches_open_i++;
                    continue;
                }

                /* If there are no opened tags and close tag is first,
                    ignore it.
                  */
                if (opened_matches.length === 0) {
                    r_matches_close_i++;
                    continue;
                }

                /* There is a match. */
                var open_match = opened_matches.pop();

                var attrs = this.getTagMatches_Attrs(open_match.match[1]);

                tag_matches.push({
                    name: tag_name,
                    open: open_match,
                    close: close_match,
                    attrs: attrs
                });
                r_matches_close_i++;
            }
        }

        this.getTagMatches_Sort(tag_matches);

        return tag_matches;
    },

    getTagMatches_Attrs: function(attrs_string)
    {
        attrs_string = ABCode.Html_Unescape(attrs_string);
        var regexp = /"(.*?)"/gm;
        while(true) {
            match = regexp.exec(attrs_string);
            if (match === null)
                break;

            var no_spaces = match[1].replace(' ', '{{space}}');
            attrs_string = attrs_string.replace(match[0], no_spaces);
        }

        var regexp = /([a-zA-Z0-9\-]+)(=(.*?))?( |$)/gm;

        var attrs = {};
        while(true) {
            var match = regexp.exec(attrs_string);
            if (match === null)
                break;

            var value = match[3];
            if (typeof value !== 'undefined') {
                value = value.replace(/{{space}}/gm, ' ');
                if (value.charAt(0) === '"' &&
                        value.charAt(match.length - 1) === '"')
                    value = value.substring(1, value.length - 1);
            }

            attrs[match[1]] = value;
        }

        return attrs;
    },

    getTagMatches_IsFirst: function(match_a, match_b)
    {
        if (match_a === null)
            return false;
        if (match_b === null)
            return true;

        if (match_a.lineIndex < match_b.lineIndex)
            return true;
        if (match_a.lineIndex > match_b.lineIndex)
            return false;

        if (match_a.match.index < match_b.match.index)
            return true;

        return false;
    },

    getTagMatches_Matches: function(lines, tag_name)
    {
        var open_tag_matches = [];
        var close_tag_matches = [];

        for (var i = 0; i < lines.length; i++) {
            var match;

            var open_tag_regexp =  new RegExp(ABCode_Parser.Regexps_OpenTag
                    .replace('{{tagName}}', tag_name), 'g');
            var close_tag_regexp = new RegExp(ABCode_Parser.Regexps_CloseTag
                    .replace('{{tagName}}', tag_name), 'g');

            while (true) {
                match = open_tag_regexp.exec(lines[i]);
                if (!match)
                    break;

                open_tag_matches.push({
                    lineIndex: i,
                    match: match
                });
            }

            while (true) {
                match = close_tag_regexp.exec(lines[i]);
                if (!match)
                    break;

                close_tag_matches.push({
                    lineIndex: i,
                    match: match
                });
            }
        }

        return {
            open: open_tag_matches,
            close: close_tag_matches
        };
    },

    getTagMatches_Sort: function(tag_matches)
    {
        tag_matches.sort(function(tag_match_a, tag_match_b) {
            if (tag_match_a.open.lineIndex < tag_match_b.open.lineIndex)
                return 1;
            if (tag_match_a.open.lineIndex > tag_match_b.open.lineIndex)
                return -1;

            return tag_match_b.open.match.index - tag_match_a.open.match.index;
        });
    },

    parseHtml: function(tag_matches)
    {
        var html = '';
        for (var i = 0; i < tag_matches.length; i++) {
            var t_match = tag_matches[i];
            var tag = this.tags[t_match.name];

            var open_info = {
                lineIndex: t_match.open.lineIndex,
                tagOffset: t_match.open.match.index,
                lineOffset: t_match.open.match.index +
                        t_match.open.match[0].length
            };
            var close_info = this.parseHtml_GetCloseInfo(t_match, open_info,
                    t_match.name);

            for (var j = open_info.lineIndex; j <= close_info.lineIndex; j++) {
                var line = this.lines[j];
                if (line.charAt(0) === '#')
                    continue;

                var start_offset = j === open_info.lineIndex ?
                        open_info.lineOffset : 0;
                var end_offset = j === close_info.lineIndex ?
                        close_info.lineOffset : line.length;

                var tag_line = line.substring(start_offset, end_offset);
                var tag_parsed_line = tag_line;

                /* Strip paragraph. */
                var tag_line_stripped = false;
                if (tag.strip) {
                    if (open_info.tagOffset === 0 &&
                            close_info.tagOffset ===
                            this.lines[close_info.lineIndex].length)
                        tag_line_stripped = true;
                    // if (j === open_info.lineIndex &&
                    //         open_info.tagOffset === 0)
                    //     tag_line_stripped = true;
                    // else if (j === close_info.lineIndex &&
                    //         open_info.tagOffset === this.lines[j].length)
                    //     tag_line_stripped = true;
                    // else if (j !== open_info.lineIndex &&
                    //         j !== close_info.lineIndex)
                    //     tag_line_stripped = true;
                }

                var tag_info = {
                    attrs: t_match.attrs
                };

                if (tag_line !== '') {
                    var line_info = {
                        content: tag_line,
                        stripped: tag_line_stripped
                    }

                    tag_parsed_line = this.tags[t_match.name].parse(tag_info,
                            line_info);
                }

                var parsed_line = '';
                if (j === open_info.lineIndex) {
                    parsed_line += line.substring(0, open_info.tagOffset);
                    parsed_line += tag.start(tag_info);
                }
                parsed_line += tag_parsed_line;
                if (j === close_info.lineIndex) {
                    parsed_line += tag.end(tag_info);
                    parsed_line += line.substring(close_info.tagOffset);
                }

                if (tag_line_stripped)
                    parsed_line = '{{strip}}' + parsed_line;

                this.lines[j] = parsed_line;
            }
        }

        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i] === '')
                continue;

            if (this.lines[i].indexOf('{{strip}}') === 0)
                html += this.lines[i].replace(/{{strip}}/g, '');
            else
                html += '<p>' + this.lines[i] + '</p>';
        }

        return html;

    },

    parseHtml_GetCloseInfo: function(t_match, open_info)
    {
        /* Search of end tag. */
        var offset = 0;
        if (t_match.open.lineIndex === t_match.close.lineIndex)
            offset = open_info.lineOffset;

        var search_line = this.lines[t_match.close.lineIndex].substring(offset);

        var close_tag_regexp = new RegExp(new RegExp(ABCode_Parser.Regexps_CloseTag
                .replace('{{tagName}}', t_match.name)));
        var close_tag_r_match =
                close_tag_regexp.exec(search_line);
        if (close_tag_r_match === null) {
            throw new Error('Parse error. Cannot find close tag for: ' +
                    t_match.name);
        }

        return {
            lineIndex: t_match.close.lineIndex,
            tagOffset: offset + close_tag_r_match.index +
                    close_tag_r_match[0].length,
            lineOffset: offset + close_tag_r_match.index
        };
    }

};
ABCode_Parser.Class.prototype = ABCode_Parser;
