angular.module("blake").controller("SlideBoxController", function($scope,$element,$attrs,$timeout){
    let vm = this;

    vm.scrollBarWidths = 40;
    vm.viewport = $element.children('.slide-box-viewport');
    vm.wrapper = vm.viewport.children('.slide-box-wrapper');
    vm.items = vm.wrapper.children();
    vm.scrollerLeft = false;
    vm.scrollerRight = false;
    vm.leftOffset = 0;
    vm.scrollBy = 660;
    vm.windowWidth = 0;


    let widthOfList = function(){
        let itemsWidth = 0;
        for (let child in vm.items) {
            itemsWidth += angular.element(child).outerWidth();
        }
        return itemsWidth;
    };

    let widthOfHidden = function(){
        vm.viewport = $element.children('.slide-box-viewport');
        return ((vm.viewport.outerWidth())-widthOfList()-vm.leftOffset)-vm.scrollBarWidths;
    };

    let reAdjust = function(){
        vm.scrollerRight = widthOfHidden() < 0;
        vm.scrollerLeft = vm.leftOffset < 0;
    };

    $scope.$on('resize::resize', function (e, w) {
        vm.windowWidth = w.width;
        reAdjust();
    });

    $scope.$on('searchCtrl::newSearch', function (e, w) {
        $timeout(function() {
            reAdjust();
        }, 0);
    });

    $scope.$on('searchCtrl::changeResult', function (e, d) {
        if(d.type == vm.type){
            vm.scrollToResult(d.objectIndex);
        }
    });

    vm.scrollRight = function(){
        let newOffset = vm.leftOffset - vm.scrollBy;
        let maxOffset = vm.viewport.outerWidth() - widthOfList() - vm.scrollBarWidths;
        if(newOffset < maxOffset){
            vm.leftOffset = maxOffset;
        } else {
            vm.leftOffset = newOffset;
        }
        reAdjust();
    };

    vm.scrollLeft = function(){
        let newOffset = vm.leftOffset + vm.scrollBy;
        if(newOffset > 0){
            vm.leftOffset = 0;
        } else {
            vm.leftOffset = newOffset;
        }
        reAdjust();
    };

    vm.scrollToResult = function(objectIndex){
        let objectStart = objectIndex * 235,
            objectEnd = objectStart + 235,
            viewWidth = vm.viewport.outerWidth();

        //Part of the handprint is hidden on the right
        if(objectEnd + vm.leftOffset > viewWidth){
            if((widthOfHidden()*-1) > viewWidth){
                vm.leftOffset = objectStart * -1;
            } else {
                vm.leftOffset = viewWidth - widthOfList() - vm.scrollBarWidths;
            }

        }

        //Part of the handprint is hidden on the left
        if(objectStart < vm.leftOffset * -1){
            vm.leftOffset = objectStart * -1;
        }

        reAdjust();
    }

});

angular.module('blake').directive("slideBox", function(){
    return {
        //replace: true,
        transclude: true,
        restrict: 'AE',
        scope: {
            type: '@type'
        },
        controller: "SlideBoxController",
        controllerAs: 'slideBox',
        bindToController: true,
        template: require('html-loader!./slideBox.html')
    }
});