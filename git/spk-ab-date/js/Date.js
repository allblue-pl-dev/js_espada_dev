'use strict';

SPK

.Module('abDate', [], [ null, {
$: {

    span_Minute: 60,
    span_Hour: 60 * 60,
    span_Day: 24 * 60 * 60,


    date_Format: function(time)
    {
        return moment.utc(time * 1000).utcOffset(this.utcOffset)
                .format(SPK.$eText.get('SPK:date_Format'));
    },

    date_StrToTime: function(str)
    {
        if (str === '')
            return null;

        /* UTC because we are interested only in day. */
        return moment.utc(str, SPK.$eText.get('SPK:date_Format'))
                .toDate().getTime() / 1000;
    },

    dateTime_Format: function(time)
    {
        return moment.utc(time * 1000).utcOffset(this.utcOffset)
                .format(SPK.$eText.get('SPK:dateTime_Format'));
    },

    dateTime_StrToTime: function(str)
    {
        if (str === '')
            return null;

        return moment.utc(str, SPK.$eText.get('SPK:dateTime_Format'))
                .toDate().getTime() / 1000 - (this.utcOffset * 60 * 60);
    },

    time_Format: function(str)
    {
        if (str === '')
            return null;

        /* UTC because we are interested only in day. */
        return moment.utc(str, SPK.$eText.get('SPK:time_Format'))
                .toDate().getTime() / 1000;
    },

    time_StrToTime: function(str)
    {
        if (str === '')
            return null;

        var timestamp = moment.utc(str, SPK.$eText.get('SPK:time_Format'))
                .toDate().getTime() / 1000 - (this.utcOffset * 60 * 60);

        return timestamp % this.span_Day;
    },

    utcOffset: 0

}}]);
