angular.module('blake').controller("CopyInfoDlController", function(){
    var vm = this;

    vm.getNote = function(note) {
        if(note) {
            let noteText = '';
            noteText = note['#text'].replace("^", '<sup>');
            noteText = noteText.replace("^", '</sup>');
            console.log(noteText);
            return noteText;
        }
    }

    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };

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