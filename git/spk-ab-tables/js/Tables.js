'use strict';


SPK

.Module('abTables', [], [ null, {
$: {

    new: function(notifications, table_info)
    {
        return SPK.$abTables_Table.create(notifications, table_info);
    }

}}])

.Module('abTables_Table', ['{{name}}'], [
function(notifications, table_info) {
    this.$public = new this.Public.Class(this);

    this.mNotifications = notifications;
    this.info = this.parseInfo(table_info);

    // try {
    //     this.eFields = SPK.$eFields.get(this.name);
    // } catch (err) {
    //     throw new Error('SPKTables not initialized.');
    // }

    this.$fields.eText = function(text, args) {
        return SPK.$eText.get(text, args);
    };

    this.fTable = this.$fields.table;
    this.fFns = this.$fields.fns;

    this.rows = [];

    this.apiFields = {};
    this.customFilterFns = {};

    this.filter = {
        value: '',
        current: '',
        timeoutId: null
    };

    this.limit = {
        start: 50,
        current: 50,
        step: 100
    };

    this.setupFields();
    this.createElems();
    this.createFns();

    this.$view = this.$layout;
}, {

    rows: null,
    currentRows: null,

    dynamic: false,

    listeners_OnApiResult: null,
    listeners_OnClick: null,
    listeners_OnFilter: null,
    listeners_OnRefresh: null,

    columnNames: null,
    columnIndexes: null,

    createElems: function()
    {
        var elems = this.$elems;

        this.createElems_Headers(elems);
        this.createElems_Filter(elems);
        this.createElems_LoadMore(elems);
        this.createElems_Select(elems);
    },

    createElems_Filter: function(elems)
    {
        var self = this;

        var updatefilter = function(evt) {
            self.filter.value = elems.filter.value;

            /* Cancel timeout if filter changed. */
            if (self.filter.timeoutId !== null) {
                self.mNotifications.finishLoading();
                clearTimeout(self.filter.timeoutId);
            }

            self.filter.timeoutId = setTimeout(function() {
                self.mNotifications.startLoading(
                        SPK.$eText.get('SPKTables:refreshTable_Loading'));

                self.limit.current = self.limit.start;

                if (self.filter.current === self.filter.value) {
                    self.mNotifications.finishLoading();
                    return;
                }

                self.filter.current = self.filter.value;
                if (self.dynamic)
                    self.refresh();
                else {
                    var rows = self.rows_Filter(self.rows);
                    self.rows_Update(rows);
                    self.filter.timeoutId = null;
                    self.mNotifications.finishLoading();
                }
            }, 300);
        };

        elems.filter.addEventListener('change', updatefilter);
        elems.filter.addEventListener('keyup', updatefilter);

        elems.filter.addEventListener('keydown', function(evt) {
            if (evt.keyCode === 13)
                evt.preventDefault();
        });
    },

    createElems_Headers: function(elems)
    {
        var self = this;

        elems.onCreate('header', function(elem, header) {
            elem.addEventListener('click', function(evt) {
                evt.preventDefault();

                var column_index = header.index;

                var column_name = self.columnNames[column_index];
                var reverse;

                if (self.info.orderBy[0] === column_name)
                    reverse = !self.info.orderBy[1];
                else
                    reverse = false;

                self.$public.setOrderBy(column_name, reverse);
            });
        });
    },

    createElems_LoadMore: function(elems)
    {
        if (this.dynamic)
            return;

        var self = this;
        elems.loadMore.addEventListener('click', function(evt) {
            evt.preventDefault();

            self.limit.current += self.limit.step;

            if (self.dynamic)
                self.refresh(true);
            else {
                var n_rows = self.rows.slice(
                        self.limit.current - self.limit.step,
                        self.limit.current);
                self.rows_Append(n_rows);
            }
        });
    },

    createElems_Select: function(elems)
    {
        var self = this;

        elems.onCreate('selectTd', function(elem, row) {
            elem.addEventListener('click', function(evt) {
                evt.stopPropagation();

                var checkbox = elem.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                row.checked = checkbox.checked;
            });
        });

        elems.onCreate('select', function(elem, row) {
            elem.addEventListener('click', function(evt) {
                row.checked = !row.checked;
                this.checked = !this.checked;
                row.checked = this.checked;
            });
        });
    },

    createFns: function()
    {
        var self = this;

        this.fFns.isColumnVisible = function(column) {
            return self.info.hiddenColumns.indexOf(
                    self.columnNames[column.index]) === -1;
        };

        this.fFns.showCaret_Up = function(header) {
            return self.columnNames[header.index] === self.info.orderBy[0] &&
                    self.info.orderBy[1];
        };

        this.fFns.showCaret_Down = function(header) {
            return self.columnNames[header.index] === self.info.orderBy[0] &&
                    !self.info.orderBy[1];
        };
    },

    filter: function()
    {
        console.log(this.rows);
    },

    getCustomFilterInfos: function()
    {
        var filter_infos = {};
        for (var filter_name in this.customFilterFns)
            filter_infos[filter_name] = this.customFilterFns[filter_name]();

        return filter_infos;
    },

    getFields: function(update)
    {
        update = typeof update === 'undefined' ? false : update;

        /* Fields */
        var fields = {};

        var table_args = this.getTableArgs();
        if (this.dynamic) {
            table_args.offset = update ? this.rows.length : 0;
            table_args.limit = this.limit.current - (update ? this.rows.length : 0);
        }

        fields.tableArgs = table_args;

        for (var field_name in this.apiFields)
            fields[field_name] = this.apiFields[field_name];

        return fields;
    },

    getSelectedRows: function()
    {
        var rows = this.$fields.table.rows;

        var s_rows = [];
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].checked)
                s_rows.push(rows[i]);
        }

        return s_rows;
    },

    getTableArgs: function()
    {
        var table_args = {};

        table_args.table = {
            filter: this.filter.value,
            orderColumnName: this.info.orderBy[0],
            orderColumnDesc: this.info.orderBy[1],
        };

        table_args.custom = this.getCustomFilterInfos();

        return table_args;
    },

    parseInfo: function(table_info)
    {
        var info = {
            columns: null,
            apiUri: null,
            image: '',
            orderBy: [ null, false ],
            hiddenColumns: []
        };

        for (var prop_name in table_info) {
            if (!(prop_name in info)) {
                throw new Error('Property `' + prop_name +
                        '` does not exist.');
            }

            if (Object.prototype.toString.call(table_info[prop_name]) ===
                    '[object Array]')
                info[prop_name] = table_info[prop_name].slice(0);
            else
                info[prop_name] = table_info[prop_name];
        }

        for (prop_name in info) {
            if (info[prop_name] === null)
                throw new Error('Property `' + prop_name + '` not set.');
        }

        this.columnNames = Object.keys(info.columns);
        this.columnIndexes = {};
        for (var i = 0; i < this.columnNames.length; i++)
            this.columnIndexes[this.columnNames[i]] = i;

        if (!(info.orderBy[0] in this.columnIndexes))
            throw new Error('Column `' + info.orderBy[0] + '` does not exist.');

        info.headers = [];
        info.order = [];
        for (var col_name in info.columns) {
            info.headers.push(info.columns[col_name].header);

            var order_by_info = info.columns[col_name].orderBy;
            if (order_by_info === null)
                continue;

            info.order.push([ this.columnIndexes[col_name], order_by_info[1],
                    order_by_info[0] ]);
        }

        info.order = info.order.sort(function(a, b) {
            return a[2] - b[2];
        });

        return info;
    },

    parseRawRows: function(raw_rows)
    {
        var rows = [];
        for (var i = 0; i < raw_rows.length; i++) {
            var cols = [];
            for (var j = 0; j < raw_rows[i].length; j++) {
                cols.push({
                    value: raw_rows[i][j],
                    html: null
                });
            }

            rows.push({
                checked: false,
                class: '',
                cols: cols
            });
        }

        if (this.listeners_OnRefresh !== null) {
            var columns = {};
            var i = 0;
            for (var column_name in this.info.columns) {
                columns[column_name] = i;
                i++;
            }

            this.listeners_OnRefresh(rows, columns);
        }

        return rows;
    },

    refresh: function(update)
    {
        if (!this.dynamic)
            update = false;
        else if (typeof update === 'undefined')
            update = false;

        this.mNotifications.startLoading(SPK.$eText.get(
                'SPKTables:refreshTable_Loading'));

        var fields = this.getFields(update);

        var self = this;
        SPK.$abApi.json(this.info.apiUri, fields, function(result) {
            if (result.isSuccess()) {
                if (self.listeners_OnApiResult !== null)
                    self.listeners_OnApiResult(result.data);

                if (!('table' in result.data)) {
                    console.warn('No `table` in result.');
                    self.rows = [];
                    self.rows_Update(self.rows);
                    return;
                }

                var rows = self.parseRawRows(result.data.table);

                if (update) {
                    self.rows = self.rows.concat(rows);
                    self.rows_Append(rows);
                } else {
                    self.rows = self.rows_Sort(rows);
                    self.rows_Update(self.rows_Filter(self.rows));
                }
            } else {
                console.warn(result);

                self.rows = [];
                self.rows_Update(self.rows);

                self.mNotifications.showMessage_Failure(
                    SPK.$eText.get('SPKTables:refreshTable_Failed'));
            }

            self.$layout.$elems.each('select', function(elem) {
                elem.checked = false;
            });

            self.mNotifications.finishLoading();
        });
    },

    rows_Append: function(rows)
    {
        this.fTable.rows.pushArray(rows);
        this.fTable.set({
            isEmpty: this.rows.length === 0,
            showLoadMore: this.rows.length >= this.limit.current
        });
    },

    rows_Filter: function(rows)
    {
        if (this.dynamic)
            return rows;

        if (this.filter.value === '')
            return rows;

        var regexp = new RegExp('.*' +
                this.filter.value.toLowerCase() + '.*');

        var f_rows = [];
        for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].cols.length; j++) {
                var col = rows[i].cols[j].value;

                if (String(col).toLowerCase().match(regexp)) {
                    f_rows.push(rows[i]);
                    break;
                }
            }
        }

        return f_rows;
    },

    rows_Sort: function(rows)
    {
        if (this.dynamic)
            return rows;

        var column_index = this.columnIndexes[this.info.orderBy[0]];

        var self = this;

        return rows.sort(function(a, b) {
            var result = self.rows_Sort_Column(a, b, column_index,
                    self.info.orderBy[1]);

            if (result !== 0)
                return result;

            for (var i = 0; i < self.info.order.length; i++) {
                var order_by = self.info.order[i];

                if (order_by[0] === column_index)
                    continue;

                result = self.rows_Sort_Column(a, b, order_by[0], order_by[1]);

                if (result !== 0)
                    return result;
            }

            return 0;
        });
    },

    rows_Sort_Column: function(a, b, column_index, reverse)
    {
        var a_value = a.cols[column_index].value;
        var b_value = b.cols[column_index].value;

        if (a_value === null)
            return b_value === null ? 0 : (!reverse ? -1 : 1);
        if (b_value === null)
            return (!reverse ? 1 : -1);

        /* Number */
        if (!isNaN(parseFloat(a_value)) && isFinite(a_value) &&
                !isNaN(parseFloat(b_value)) && isFinite(b_value)) {
            if (reverse)
                return b_value - a_value;
            else
                return a_value - b_value;
        }

        /* Boolean */
        if (typeof a_value === 'boolean' && typeof b_value === 'boolean') {
            if (a_value === b_value)
                return 0;

            if (reverse)
                return a_value ? -1 : 1;
            else
                return a_value ? -1 : 1;
        }

        /* String / Other */
        a_value = a_value + '';
        b_value = b_value + '';

        if (reverse)
            return -a_value.localeCompare(b_value);
        else
            return a_value.localeCompare(b_value);
    },

    rows_Update: function(rows)
    {
        var t_rows;
        if (this.dynamic)
            t_rows = rows;
        else
            t_rows = rows.slice(0, this.limit.current);

        this.fTable.rows.set([]);
        this.fTable.rows.set(t_rows);
        this.fTable.set({
            isEmpty: rows.length === 0,
            showLoadMore: rows.length >= this.limit.current
        });

        this.fTable.colsLength = t_rows.length  === 0 ?
                0 : t_rows[0].cols.length;
    },

    setupFields: function()
    {
        this.fTable.set({
            headers: this.info.headers,
            rows: [],
            isEmpty: true,
            showSearch: true,
            showLoadMore: false,
            colsLength: this.info.columns.length + (this.info.image ? 1 : 0),
            selectable: false
        });
    },

    updateRows: function(rows)
    {
        this.fTable.rows.set(rows);
        this.fTable.set({

        })

        if (this.fTable.rows.length >=  this.limit.current)
            return;

        var new_rows_start = this.fTable.length;
        this.fTable.rows.push_Array(this.rows.slice(new_rows_start,
                self.limit.current));
    },

    Public: Object.create(null, {

        Class: { value:
        function(table) {
            Object.defineProperties(this, {
                fields: { value: table.$fields },

                _table: { value: table }
            });
        }},

        addCustomFilter: { value:
        function(filter_name, filter_fields_fn) {
            this._table.customFilterFns[filter_name] = filter_fields_fn;
            return this;
        }},

        colInfos: {
        get: function() {
            return this._table.columnIndexes;
        }},

        getApiFields: { value:
        function() {
            return this._table.getFields();
        }},

        getLayout: { value:
        function() {
            return this._table.$layout;
        }},

        getSelectedRows: { value:
        function() {
            return this._table.getSelectedRows();
        }},

        getTableArgs: { value:
        function() {
            return this._table.getTableArgs();
        }},

        filter: { get:
        function() {
            return this._table.filter.value;
        }},

        refresh: { value:
        function() {
            this._table.refresh(false);
        }},

        setApiFields: { value:
        function(fields) {
            this._table.apiFields = fields;
            return this;
        }},

        setDynamic: { value:
        function(dynamic) {
            this._table.dynamic = dynamic;
            return this;
        }},

        setHiddenColumns: { value:
        function(hidden_columns) {
            this._table.info.hiddenColumns = hidden_columns;

            this._table.fTable.headers = [];
            this._table.fTable.headers = this._table.info.headers;

            return this;
        }},

        setImage: { value:
        function(image_uri) {
            this._table.fTable.image = image_uri;
            return this;
        }},

        setLimit: { value:
        function(limit, step) {
            this._table.limit.start = limit;
            this._table.limit.current = limit;
            this._table.limit.step = limit;

            return this;
        }},

        setSelectable: { value:
        function(selectable) {
            if (selectable)
                this._table.fTable.colsLength++;

            this._table.fTable.selectable = selectable;
            return this;
        }},

        setOrderBy: { value:
        function(column_name, reverse) {
            reverse = typeof reverse === 'undefined' ? false : reverse;

            this._table.info.orderBy[0] = column_name;
            this._table.info.orderBy[1] = reverse;

            this._table.fFns.update('showCaret_Down');
            this._table.fFns.update('showCaret_Up');

            this._table.limit.current = this._table.limit.start;

            if (this._table.dynamic)
                this._table.refresh();
            else {
                this._table.rows = this._table.rows_Sort(this._table.rows);
                var rows = this._table.rows_Filter(this._table.rows);
                this._table.rows_Update(rows);
            }

            return this;
        }},

        setShowSearch: { value:
        function(show_search) {
            this._table.fTable.showSearch = show_search;
            return this;
        }},

        setRows: { value:
        function(rows) {
            var parsed_rows = this._table.parseRawRows(rows);
            this._table.rows = this._table.rows_Sort(parsed_rows);
            this._table.rows_Update(this._table.rows_Filter(this._table.rows));
        }},

        onApiResult: { value:
        function(fn) {
            this._table.listeners_OnApiResult = fn;
            return this;
        }},

        onClick: { value:
        function(fn) {
            var self = this;

            var add_event_listener = this._table.listeners_OnClick === null;

            this._table.fTable.trClass = 'clickable';
            this._table.listeners_OnClick = fn;

            var column_indexes = this._table.columnIndexes;

            /* Not right. Fix it future me. */
            if (add_event_listener) {
                this._table.$layout.$elems.onCreate('rows', function(elem, row) {
                    elem.addEventListener('click', function() {
                        var col_values = [];
                        for (var i = 0; i < row.cols.length; i++)
                            col_values.push(row.cols[i].value);

                        self._table.listeners_OnClick(col_values, column_indexes);
                    });
                });
            }

            return this;
        }},

        onRefresh: { value:
        function(fn) {
            this._table.listeners_OnRefresh = fn;
            return this;
        }}

    })

}, function(module_class) {
    module_class.Public.Class.prototype = module_class.Public;
}]);
