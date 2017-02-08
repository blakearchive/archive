angular.module("blake").controller("ObjectResultHighlightController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").component("objectResultHighlight", {
    template: require("html-loader!./template.html"),
    controller: "ObjectResultHighlightController",
    scope: {
        results: '=results',
        tree: '@tree',
        type: '@type'
    },
    controllerAs: "orh"
});