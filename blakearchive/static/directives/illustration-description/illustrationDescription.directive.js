(function(){

    var controller = function($routeParams){
        var vm = this;
        
        //vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : '';

    }

    controller.$inject = ['$routeParams'];

    var illustrationDescription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/illustration-description/illustrationDescription.html',
            controller: controller,
            scope: {
                object: '=object',
                highlight: '@highlight',
                keywords: '@keywords'
            },
            controllerAs: 'descCtrl',
            bindToController: true
        };
    }


    angular.module('blake').directive('illustrationDescription', illustrationDescription);

}());