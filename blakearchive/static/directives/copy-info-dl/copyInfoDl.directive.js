angular.module("blake").controller("copyInfoDlController", function(){
    const vm = this;

    vm.getNote(note) = function(note) {
        if(note) {
            let noteText = '';
            noteText = note['#text'].replace("^", '<sup>');
            noteText = note['#text'].replace("^", '</sup>');
            return noteText;
        }
    }

});

angular.module('blake').directive('copyInfoDl', function(){

    return {
        restrict: 'EA',
        template: require('html-loader!./copyInfoDl.html'),
        controller: function () { var vm = this; },
        scope: {
            infoObject: '=',
            dt: '@',
            highlight: '@'
        },
        controller: "copyInfoDlController",
        controllerAs: 'dl',
        bindToController: true
    };
});