(function(){

    var controller = function(){
        var vm = this;
    }

    var illustrationDescription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/illustration-description/illustrationDescription.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'descCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('illustrationDescription', illustrationDescription);

}());