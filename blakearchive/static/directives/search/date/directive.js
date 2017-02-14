angular.module("blake").controller("DateSearchFieldController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("dateSearchField", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "DateSearchFieldController",
        controllerAs: "dsf",
        replace: true
    }
});