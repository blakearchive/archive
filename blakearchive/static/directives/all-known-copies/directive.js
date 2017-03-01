angular.module("blake").controller("AllKnownCopiesController", function(){
    const vm = this;

    vm.getInfo = function(info){
        return info.split('<br />')
    }
});

angular.module('blake').directive('allKnownCopies', function(){
    return {
        restrict: 'E',
        template: require('html-loader!./template.html'),
        controller: "AllKnownCopiesController",
        controllerAs: 'akc',
        replace: true,
        bindToController: true,
        scope: {
            work: '=work'
        }
    };
});