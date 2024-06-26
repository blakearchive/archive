angular.module("blake").controller("WorkCopiesController", function (BlakeDataService) {
    var vm = this;
    vm.bds = BlakeDataService;
});

angular.module('blake').directive("workCopies", function () {
    return {
        restrict: 'E',
        template: require('html-loader!./workCopies.html'),
        controller: "WorkCopiesController",
        controllerAs: 'workCopies',
        bindToController: true
    };
});
