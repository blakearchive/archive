angular.module("blake").controller("PreviewBoxController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;

    vm.hidden = function () {
        return vm.s.selectedWork == -1 || vm.s.type == vm.type;
    };
    
    vm.showObjectsInVirtualWorkPreview = function () {
        return (
            vm.results &&
            vm.s.selectedWork >= 0 &&
            vm.results[vm.s.selectedWork][1] > 1 &&
            vm.tree == 'object' &&
            vm.results[vm.s.selectedWork][0].virtual
        );
    };
    
    vm.showObjectsInCopyPreview = function () {
        return (
            vm.results &&
            vm.s.selectedWork >=0 &&
            vm.results[vm.s.selectedWork][2][vm.s.selectedCopy][1] > 1 &&
            vm.tree == 'object' &&
            !vm.results[vm.s.selectedWork][0].virtual
        );
    };
    
    vm.showCopiesInWorkPreview = function () {
        return (
            vm.results &&
            vm.selectedWork >= 0 &&
            vm.results[vm.s.selectedWork][1] > 1 &&
            vm.tree == 'copy'
        );
    }
});

angular.module("blake").directive("previewBox", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewBoxController",
        scope: {
            results: '=results',
            tree: '@tree',
            type: '=type'
        },
        controllerAs: "pb",
        bindToController: true,
        replace: true
    }
});