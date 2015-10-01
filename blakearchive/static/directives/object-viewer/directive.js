/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("objectViewer", function () {
    return {
        restrict: 'E',
        templateUrl: "/blake/static/directives/object-viewer/template.html",
        controller: "ObjectViewerController"
    }
});

angular.module('blake').controller("ObjectViewerController",['$rootScope', '$scope', '$timeout', 'BlakeDataService', 'UtilityServices', function ($rootScope, $scope, $timeout, BlakeDataService, UtilityServices) {
    $rootScope.showSubMenu = 1;
    $scope.BlakeDataService = BlakeDataService;

    $scope.getPreviousNextObjects = function () {
        if ($scope.objects && $scope.objects.length) {
            for (var i = $scope.objects.length; i--;) {
                if ($scope.objects[i].object_id == $scope.obj.object_id) {
                    // Extra code here to make the list circular
                    if (i - 1 < 0) {
                        $scope.previousObject = $scope.objects[$scope.objects.length - 1];
                    } else {
                        $scope.previousObject = $scope.objects[i - 1];
                    }
                    if (i + 1 >= $scope.objects.length) {
                        $scope.nextObject = $scope.objects[0];
                    } else {
                        $scope.nextObject = $scope.objects[i + 1];
                    }
                    break;
                }
            }
        }
    };

    $scope.getObjLines = function () {
        var objLines = [];
        if ($scope.obj) {
            if ($scope.obj.text && $scope.obj.text.lg && $scope.obj.text.lg.length) {
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

    /**
     *
     * @param set_delay in milliseconds
     * * Get the height of the object detail.
     * Pretty awkward solution to the way Design Hammer set this up. Image loaded via Ajax, so need a delay to execute getting correct height
     * Default angular solution seems to always set to 0.
     */
    function getImageHeight(set_delay) {
       angular.element(document).ready(function () {
            $timeout(function() {
                var response_change = {};

                response_change.waitForIdle = function(fn, delay) {
                  var timer = null;
                  return function () {
                    var context = this,
                        args = arguments;
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                      fn.apply(context, args);
                    }, delay);
                  };
                };

                var object_view = $("#object-view");

                // Set the max-height for the detail tray in object view.
                if ( $('#object-detail-tray').length ) {
                    UtilityServices.trayHeight(object_view);
                    object_view.resize(response_change.waitForIdle(function() {
                        UtilityServices.trayHeight(object_view);
                    }, 10));
                }
            }, set_delay);
        });
    }

    getImageHeight(0);

    $scope.openWindow = function(e) {
        var full_text = e.target.innerHTML;
        window.open()
    };

    angular.element(document).ready(function () {
        $timeout(function() {
            var hidden = $('div.panel-collapse');
            var button = $('.new-window');

            if (hidden.hasClass('in')) {
                button.removeClass('hide')
            } else {
                button.addClass('hide');
            }
        }, 0);
    });


    $scope.copy = BlakeDataService.getSelectedCopy();
    $scope.objects = BlakeDataService.getSelectedCopyObjects();
    $scope.obj = BlakeDataService.getSelectedObject();
    $scope.getPreviousNextObjects();

    $scope.$on("copySelectionChange", function () {
        $scope.copy = BlakeDataService.getSelectedCopy();
    });

    $scope.$on("copySelectionObjectsChange", function () {
        $scope.objects = BlakeDataService.getSelectedCopyObjects();
    });

    $scope.$on("objectSelectionChange", function () {
        $scope.obj = BlakeDataService.getSelectedObject();
        $scope.getPreviousNextObjects();
        getImageHeight(0)
    })
}]);