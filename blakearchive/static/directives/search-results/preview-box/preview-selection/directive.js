angular.module("blake").controller("PreviewSelectionController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
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
        controllerAs: "ps"
    }
});