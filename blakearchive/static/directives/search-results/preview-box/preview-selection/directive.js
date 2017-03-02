angular.module("blake").controller("PreviewSelectionController", function (SearchService, scope) {
    let vm = this;
    vm.s = SearchService;
    
        let vm.results = scope.results,
            vm.s.type = scope.type,
            vm.tree = scope.tree;
});

angular.module("blake").directive("previewSelection", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewSelectionController",
        bindToController: true,
        scope: {
            results: '<results',
            type: '<type',
            tree: '<tree'
        },
        controllerAs: "ps",
    }
});