angular.module('blake').controller("CopyInfoDlController", function($scope,$sce){
    var vm = this;

    vm.getNote = function(note) {
        if(note) {
            let noteText = note['#text'];
            console.log(noteText)
            while(noteText.indexOf('^') > -1) {
                noteText = noteText.replace("^", '<sup>');
                noteText = noteText.replace("^", '</sup>');
            }
            while(noteText.indexOf('*') > -1) {
                noteText = noteText.replace("*", '<i>');
                noteText = noteText.replace("*", '</i>');
            }
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