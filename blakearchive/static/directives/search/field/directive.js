angular.module("blake").controller("FieldSearchFieldController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("fieldSearchField", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "FieldSearchFieldController",
        controllerAs: "fsf",
        replace: true
    }
});