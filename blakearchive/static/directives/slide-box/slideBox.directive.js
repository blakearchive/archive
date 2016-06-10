/**
 * Slidebox Directive
 *
 * version 0.9
 * http://github.com/keithjgrant/slidebox
 *
 * by Keith J Grant
 * http://elucidblue.com
 */

(function(){

    var controller = function($scope,$element,$attrs,$timeout){

        var vm = this;

        vm.scrollBarWidths = 40;
        vm.viewport = $element.children('.slide-box-viewport');
        vm.wrapper = vm.viewport.children('.slide-box-wrapper');
        vm.items = vm.wrapper.children();
        vm.scrollerLeft = false;
        vm.scrollerRight = false;
        vm.leftOffset = 0;
        vm.scrollBy = 660;
        vm.windowWidth = 0;


        var widthOfList = function(){
            var itemsWidth = 0;
            angular.forEach(vm.items,function(child){
                var itemWidth = angular.element(child).outerWidth();
                itemsWidth+=itemWidth;
            })
            return itemsWidth;
        };

        var widthOfHidden = function(){
            vm.viewport = $element.children('.slide-box-viewport');
            return ((vm.viewport.outerWidth())-widthOfList()-vm.leftOffset)-vm.scrollBarWidths;
        };

        var reAdjust = function(){
            if (widthOfHidden() >= 0) {
                vm.scrollerRight = false;
            } else {
                vm.scrollerRight = true;
            }

            if (vm.leftOffset<0) {
                vm.scrollerLeft = true;
            } else {
                //$('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
                vm.scrollerLeft = false;
            }
        }

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
            console.log(d);
            if(d.type == vm.type){
                console.log('match');
                console.log(d);
                vm.scrollToResult(d.objectIndex);
            }
        });

        vm.scrollRight = function(){
            var newOffset = vm.leftOffset - vm.scrollBy;
            var maxOffset = vm.viewport.outerWidth() - widthOfList() - vm.scrollBarWidths;
            if(newOffset < maxOffset){
                vm.leftOffset = maxOffset;
            } else {
                vm.leftOffset = newOffset;
            }
            reAdjust();
        }

        vm.scrollLeft = function(){
            var newOffset = vm.leftOffset + vm.scrollBy;
            if(newOffset > 0){
                vm.leftOffset = 0;
            } else {
                vm.leftOffset = newOffset;
            }
            reAdjust();
        }

        vm.scrollToResult = function(objectIndex){
            var objectStart = objectIndex * 235,
                objectEnd = objectStart + 235,
                viewWidth = vm.viewport.outerWidth();

            //Part of the handprint is hidden on the right
            if(objectEnd + vm.leftOffset > viewWidth){
                console.log('object hidden right')
                if((widthOfHidden()*-1) > viewWidth){
                    vm.leftOffset = objectStart * -1;
                } else {
                    vm.leftOffset = viewWidth - widthOfList() - vm.scrollBarWidths;
                }

            }

            //Part of the handprint is hidden on the left
            if(objectStart < vm.leftOffset * -1){
                console.log('object hidden left');
                vm.leftOffset = objectStart * -1;
            }

            reAdjust();
        }

    }

    var slideBox = function(){
            return {
                //replace: true,
                transclude: true,
                restrict: 'AE',
                scope: {
                    type: '@type'
                },
                controller: controller,
                controllerAs: 'slideBox',
                bindToController: true,
                templateUrl: '/blake/static/directives/slide-box/slideBox.html'
            }
    }

    angular.module('blake').directive("slideBox", slideBox);

}());