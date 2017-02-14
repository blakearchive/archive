angular.module("blake").controller("PreviewHeaderController", function ($scope, SearchService) {
    let vm = this;
    vm.s = SearchService;

    vm.showCopiesDropdown = function () {
        try {
            let multipleCopies = $scope.results[$scope.s.selectedWork][2].length > 1,
                isVirtual = $scope.results[$scope.s.selectedWork][0].virtual;
            return multipleCopies && $scope.s.tree == 'object' && !isVirtual;
        } catch (e) {
            return false;
        }
    }
});

angular.module("blake").directive("previewHeader", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewHeaderController",
        scope: {
            results: '<results',
            tree: '<tree'
        },
        controllerAs: "ph",
        replace: true
    }
});