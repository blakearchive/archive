angular.module("blake").factory("FormatService", function () {
    var cap = function (full_text) {
        if (/\s+copy\s+/.test(full_text)) {
            return full_text.replace(/copy/, 'Copy');
        }
        return false;
    };

    return {
        cap: function () {
            return cap();
        }
    }
});