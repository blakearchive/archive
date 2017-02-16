angular.module("blake").controller("PreviewHeaderController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;

    vm.showCopiesDropdown = function () {
        try {
            let multipleCopies = vm.results[vm.s.selectedWork][2].length > 1,
                isVirtual = vm.results[vm.s.selectedWork][0].virtual;
            return multipleCopies && vm.tree == 'object' && !isVirtual;
        } catch (e) {
            return false;
        }
    }
});

angular.module("blake").directive("previewHeader", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewHeaderController",
        bindToController: true,
        scope: {
            results: '<results',
            tree: '<tree'
        },
        controllerAs: "ph",
        replace: true
    }
});