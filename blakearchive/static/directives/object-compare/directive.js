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

angular.module('blake').controller("ObjectCompareController",['$scope', '$timeout', 'BlakeDataService', 'UtilityServices', function ($scope, $timeout, BlakeDataService, UtilityServices) {

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

    // Horizontal Scroll with fixed height/width images
    var response_change = UtilityServices.responseChange();

    function setObjectCompare() {
      var compare_object_width = 0;
      $('#object-view #compare .item').each(function() {
        compare_object_width += Number( $(this).width() );
      });

      $('#object-view #compare .compare-inner').css('width', (compare_object_width + 10) + 'px');
    }

    function objectCompareHeight() {
      var set_object_compare_height = $(window).height() - 370;
      $('#object-view #compare .featured-object img').css('height', set_object_compare_height + 'px');
    }

    angular.element(document).ready(function () {
        $timeout(function() {
            //  $('#home').removeClass('main'); // Need class main for overall app, but not this directive

            setObjectCompare();
            objectCompareHeight();

             var object_view = $("div.compare-inner");

             // Set the max-height for the detail tray in object view.
             var trayHeight = UtilityServices.trayHeight(object_view);

             if ( $('#object-detail-tray').length ) {
                 trayHeight();

                 object_view.resize(response_change.waitForIdle(function() {
                     trayHeight();
                 }, 10));
             }
        }, 0);
    });

    $(window).on('resize', response_change.waitForIdle(function() {
        setObjectCompare();
    }, 100));

    $(window).on('resize', response_change.waitForIdle(function() {
        objectCompareHeight();
      }, 100));

}]);