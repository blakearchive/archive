angular.module('blake').controller("CopyInfoDlController", function(){
    var vm = this;

    vm.getNote = function(note) {
        if(note) {
            let noteText = '';
            noteText = note['#text'].replace("^", '<sup>');
            noteText = note['#text'].replace("^", '</sup>');
            return noteText;
        }
    }

});

angular.module('blake').directive("copyInfoDl", function(){

    return {
        restrict: 'EA',
        template: require('html-loader!./copyInfoDl.html'),
        scope: {
            infoObject: '=',
            dt: '@',
            highlight: '@'
        },
        controller: "CopyInfoDlController",
        controllerAs: 'dl',
        bindToController: true
    };
});