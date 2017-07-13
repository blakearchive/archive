angular.module("blake").controller("AllKnownRelatedItemsController", function(){
    const vm = this;

    vm.getInfo = function(info){
        return info.split('<br />')
    }
});

angular.module('blake').directive('allKnownRelatedItems', function(){
    return {
        restrict: 'E',
        template: require('html-loader!./template.html'),
        controller: "AllKnownRelatedItemsController",
        controllerAs: 'akri',
        replace: true,
        bindToController: true,
        scope: {
            work: '=work'
        }
    };
});