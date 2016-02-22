(function(){

    var controller = function(){
        var vm = this;
    }

    var teiMarkup = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/tei-markup/teiMarkup.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'teiCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('teiMarkup', teiMarkup);

}());