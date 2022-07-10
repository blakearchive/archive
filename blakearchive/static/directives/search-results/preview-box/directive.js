angular.module("blake").controller("PreviewBoxController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;

    vm.hidden = function () {
        return vm.s.selectedWork == -1 || vm.s.type != vm.type;
    };
    
    vm.showObjectsInVirtualWorkPreview = function () {
        try {
            let multipleObjects = vm.results[vm.s.selectedWork][1] > 0,
                isVirtual = vm.results[vm.s.selectedWork][0].virtual;
            return multipleObjects && vm.tree == 'object' && isVirtual;
        } catch (e) {
            return false;
        }
    };
    
    vm.showObjectsInCopyPreview = function () {
        try {
            let multipleObjects = vm.results[vm.s.selectedWork][2][vm.s.selectedCopy][1] > 0,
                isVirtual = vm.results[vm.s.selectedWork][0].virtual;
            return multipleObjects && vm.tree == 'object' && !isVirtual;
        } catch (e) {
            return false;
        }
    };
    
    vm.showCopiesInWorkPreview = function () {
        try {
            let multipleObjects = vm.results[vm.s.selectedWork][1] > 0;
            return multipleObjects && vm.tree == 'copy';
        } catch (e) {
            return false;
        }
    }
});

angular.module("blake").directive("previewBox", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewBoxController",
        scope: {
            results: '<results',
            tree: '<tree',
            type: '<type'
        },
        controllerAs: "pb",
        bindToController: true,
        replace: true
    }
});