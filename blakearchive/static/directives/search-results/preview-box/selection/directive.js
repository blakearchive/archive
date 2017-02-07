angular.module("blake").controller("PreviewSelectionController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").component("previewSelection", {
    template: require("html-loader!./template.html"),
    controller: "PreviewSelectionController",
    scope: {
        results: '=results',
        tree: '@tree'
    },
    controllerAs: "ps"
});