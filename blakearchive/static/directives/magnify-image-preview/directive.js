angular.module("blake").directive('magnifyImagePreview', function($interval, $window, $rootScope, imageManipulation, BlakeDataService){
    let link = function(scope,ele,attr,vm){
        if($rootScope.zoom){

        }
        let native_width = 0;
        let native_height = 0;
        let mouse = {x: 0, y: 0};

        let magnify = function(e) {
            let newX, newY, rx, ry, bg_pos, glass_left, glass_top;
            // The background position of div.glass will be
            // changed according to the position
            // of the mouse over the img.magniflier
            //
            // So we will get the ratio of the pixel
            // under the mouse with respect
            // to the image and use that to position the
            // large image inside the magnifying glass

            if(imageManipulation.transform.orientation == 4){
                newY = cur_img.width() - mouse.y;
                rx = Math.round(newY/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                ry = Math.round(mouse.x/cur_img.height()*native_height - ui.glass.height()/2)*-1;
            }

            if (imageManipulation.transform.orientation == 3){
                newY = cur_img.height() - mouse.y;
                newX = cur_img.width() - mouse.x;
                rx = Math.round(newX/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                ry = Math.round(newY/cur_img.height()*native_height - ui.glass.height()/2)*-1;
            }
            if (imageManipulation.transform.orientation == 2) {
                newX = cur_img.height() - mouse.x;
                rx = Math.round(mouse.y / cur_img.width() * native_width - ui.glass.width() / 2) * -1;
                ry = Math.round(newX / cur_img.height() * native_height - ui.glass.height() / 2) * -1;
            }

            if (imageManipulation.transform.orientation == 1){
                rx = Math.round(mouse.x/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                ry = Math.round(mouse.y/cur_img.height()*native_height - ui.glass.height()/2)*-1;

            }

            bg_pos = rx + "px " + ry + "px";

            // Calculate pos for magnifying glass
            //
            // Easy Logic: Deduct half of width/height
            // from mouse pos.

            glass_left = e.pageX - ui.glass.width() / 2;
            glass_top  = e.pageY - ui.glass.height() / 2;

            // Now, if you hover on the image, you should
            // see the magnifying glass in action
            ui.glass.css({
                left: glass_left,
                top: glass_top,
                backgroundPosition: bg_pos
            });
        };

        let cur_img;

        let ui = {
            magnifier: ele
        };

        // Add the magnifying glass
        if (ui.magnifier.length) {
            let div = document.createElement('div');
            div.setAttribute('class', 'glassPreview');
            ui.glass = angular.element(div);

            angular.element(document.body).append(div);
        }


        let mouseMove = function(e) {

            // Container offset relative to document
            let checkWidth, checkHeight, magnify_offset = cur_img.offset();

            // Mouse position relative to container
            // pageX/pageY - container's offsetLeft/offetTop
            if((imageManipulation.transform.rotate % 180) != 0){
                checkHeight = cur_img.width();
                checkWidth = cur_img.height();
            } else {
                checkHeight = cur_img.height();
                checkWidth = cur_img.width();
            }
            mouse.x = e.pageX - magnify_offset.left;
            mouse.y = e.pageY - magnify_offset.top;


            // The Magnifying glass should only show up when the mouse is inside
            // It is important to note that attaching mouseout and then hiding
            // the glass wont work cuz mouse will never be out due to the glass
            // being inside the parent and having a higher z-index (positioned above)
            if (mouse.x < checkWidth && mouse.y < checkHeight && mouse.x > 0 && mouse.y > 0) {
                magnify(e);
            } else {
                ui.glass.removeClass('glass-on');
            }
        };

        ele.on('mousemove', function() {
            if($rootScope.zoom){

                cur_img = angular.element(this);

                let src = cur_img.attr('src');
                src = src.replace('100','300');

                if (src) {
                    ui.glass.css({
                        'background-image': 'url(' + src + ')',
                        'background-repeat': 'no-repeat'
                    });
                }

                // When the user hovers on the image, the script will first calculate
                // the native dimensions if they don't exist. Only after the native dimensions
                // are available, the script will show the zoomed version.
                if (!cur_img.data('native_width')) {
                    // This will create a new image object with the same image as that in .small
                    // We cannot directly get the dimensions from .small because of the
                    // width specified to 200px in the html. To get the actual dimensions we have
                    // created this image object.
                    let image_object = new Image();

                    image_object.onload = function() {
                        // This code is wrapped in the .load function which is important.
                        // width and height of the object would return 0 if accessed before
                        // the image gets loaded.
                        native_width = image_object.width;
                        native_height = image_object.height;

                        cur_img.data('native_width', native_width);
                        cur_img.data('native_height', native_height);

                        ui.glass.addClass('glass-on');

                        mouseMove.apply(this, arguments);

                        ui.glass.on('mousemove', mouseMove);
                    };


                    image_object.src = src;

                    return;
                } else {

                    native_width = cur_img.data('native_width');
                    native_height = cur_img.data('native_height');
                }

                ui.glass.addClass('glass-on');

                mouseMove.apply(this, arguments);

                ui.glass.on('mousemove', mouseMove);
            }
        });

        ui.glass.on('mouseout', function() {
            ui.glass.off('mousemove', mouseMove);
        });

        scope.$watch(function(){return imageManipulation.transform},function(){
            ui.glass.css(imageManipulation.transform.style);
        },true);

        scope.$watch(function(){return $rootScope.zoom},function(){
            if(!$rootScope.zoom){
                ui.glass.removeClass('glass-on');
            }
        },true);

        scope.$watch(function(){return BlakeDataService.object},function(){
            if(angular.isDefined(cur_img)){
                cur_img.data('native_width', false);
                cur_img.data('native_height', false);
            }
        },true);

    };

    return {
        restrict: 'A',
        link: link
    }
});