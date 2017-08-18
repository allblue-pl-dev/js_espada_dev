'use strict';


SPK

.Module('abForms', [], [ null, {
$: {

    new: function()
    {
        return SPK.$abForms_Form.create.apply(null, arguments);
    }

}}]);
