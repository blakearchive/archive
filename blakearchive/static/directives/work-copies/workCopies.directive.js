(function() {

    /** @ngInject */
    var controller = function (BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;

    }

    var workCopies = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-copies/workCopies.html',
            controller: controller,
            controllerAs: 'workCopies',
            bindToController: true
        };
    }

    angular.module('blake').directive("workCopies", workCopies);


}());