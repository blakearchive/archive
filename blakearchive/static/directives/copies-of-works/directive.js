angular.module('blake').directive('copiesWorks', function() {
    function link(scope, element, attrs) {
        scope.$watch('copies', function (data) {
            if (!data) { return; }

            data.sort(function(a, b) { return a.source.comp_date["@value"] - b.source.comp_date["@value"]; });

            var copies = {};

            scope.copies = copies;
        });
    }

    return {
        restrict: 'C',
        link: link,
        scope: {
            copies: '='
        },
        templateUrl: '/blake/static/directives/copies-of-works/template.html'
    };
});
