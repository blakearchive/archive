angular.module('blake').directive('copyInformation', function() {
    function link(scope, element, attrs) {
        scope.$watch('copyinfo', function (data) {
            if (!data) { return; }
            scope.copy_metadata = data;
        });
    }

    return {
        restrict: 'C',
        link: link,
        scope: {
            copyinfo: '='
        },
        templateUrl: '/blake/static/directives/copy-info/template.html'
    };
});

angular.module('blake').controller("CopyInfoController", function ($scope, BlakeDataService) {
    BlakeDataService.getObjectsForCopy().then(function(data) {
        $scope.metadata = data;
    })
});