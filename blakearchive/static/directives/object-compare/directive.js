/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("objectCompare", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/object-compare/template.html",
        controller: "ObjectCompareController"
    }
});

angular.module('blake').controller("ObjectCompareController",['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {

    $scope.BlakeDataService = BlakeDataService;

    $scope.getObjLines = function () {
        var objLines = [];
        if ($scope.obj) {
            if ($scope.obj.text.lg.length) {
                $scope.obj.text.lg.forEach(function (lg) {
                    if (lg.l.length) {
                        lg.l.forEach(function (l) {
                            objLines.push(l["#text"]);
                        })
                    } else {
                        objLines.push(lg.l["#text"])
                    }
                });
            } else {

            }
        }
        return objLines;
    };

    $scope.toggleTray = function () {
        var $detail_tray = $('#object-container');

        if ($detail_tray.hasClass('tray-closed')) {
            $detail_tray.removeClass('tray-closed').addClass('tray-open');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
            $('.scrollbar').scroller('reset');
        } else {
            $detail_tray.removeClass('tray-open').addClass('tray-closed');
            $('.scrollbar').scroller('reset');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
        }
    };

    $scope.comparisonObjects = BlakeDataService.getComparisonObjects();
    $scope.obj = BlakeDataService.getSelectedObject();

    $scope.$on("comparisonObjectsChange", function () {
        $scope.comparisonObjects = BlakeDataService.getComparisonObjects();
    });

    $scope.$on("objectSelectionChange", function () {
        $scope.obj = BlakeDataService.getSelectedObject();
    });


}]);