angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants,
      alertFactory,
      worktitleService
    ) {
        $scope.fabric = {};
        $scope.loaded = 0;            // number of images loaded
      	$scope.FabricConstants = FabricConstants;
        $scope.maxHeight = 0;
        $scope.showCaption= false;
        $scope.caption = null;

        // note: the cart items are from browsers local storage
        $scope.images = CartStorageService.cartItems;

        // init(): bootstraps fabric to the canvas element
        // called on canvas::created event... see below
        $scope.init = function() {
  		    $scope.fabric = new Fabric({
      			JSONExportProperties: FabricConstants.JSONExportProperties,
      			textDefaults: FabricConstants.textDefaults,
      			shapeDefaults: FabricConstants.shapeDefaults,
      			json: {}
  		    });

          // Initial canvas size is the window size.
          $scope.fabric.setCanvasSize(window.innerWidth,window.innerHeight);

          // register event handlers...
          FabricCanvas.getCanvas().on('object:added',$scope.handleObjectAdded);
          FabricCanvas.getCanvas().on('object:selected',$scope.handleObjectSelected);
          FabricCanvas.getCanvas().on('mouse:up',$scope.handleCanvasClicked);
          $('#lb-crop-btn').on('click',$scope.cropButtonClicked);
          $('#lb-trash-btn').on('click',$scope.trashButtonClicked);
          $('#lb-info-btn').on('click',$scope.infoButtonClicked);
          $('#lb-save-btn').on('click',$scope.saveButtonClicked);
          $('#lb-load-btn').on('click',$scope.loadButtonClicked);
          $('#lb-clear-btn').on('click',$scope.clearButtonClicked);

          // deal with cropping and cart changes ... we assume that the clients
          // browser supports localStorage (html5)
          window.addEventListener('storage',function(e){
            //console.log("storage event!"+e.type+":"+e.key+":"+e.newValue+":"+e.storageArea);
            if (e.key == 'cart-items-angularjs'){
              if (e.oldValue && (e.newValue.length > e.oldValue.length)){
                var cart = JSON.parse(e.newValue);
                var last = cart.pop();

                console.log("Item was added to the cart: "+JSON.stringify(last));

                $scope.addImage(last.url,400);
              }
            }else if (e.key == 'lbox-cropped-image'){
              if (e.newValue != null){
                console.log("An Image was cropped!");
                // TODO: add it at natural resolution... not width contrained!!!
                $scope.addImage(e.newValue,400);
              }
            }
          },false);
          // for dev... may need to test if a load is required...
          // not required on re-entry (when lbox window is already opened)
          $scope.loadFromCart();
    	  }; /// ===> End of $scope.init()

        $scope.findCaption = function(){
          //console.log("=== finding caption!");
          $scope.caption = null;
          var ao = FabricCanvas.getCanvas().getActiveObject();
          if (ao){
            // look through the cart...
            $scope.images.forEach(function(entry){
                if (ao.getSrc().endsWith(entry.url)){
                  // found it!
                  //console.log("!!! found it: "+entry.title+": "+entry.caption);
                  $scope.caption = entry.title+": "+entry.caption;
                }

            });
          }
        };

        // ===================================================================
        // Methods dealing with loading images into fabric from the cart
        // ===================================================================
        $scope.loadFromCart = function(){
          var sensibleWidth = $scope.determineLoadingWidth(window.innerWidth);

          var icount = 0;
          $scope.images.forEach(function(entry){
            var imgUrl = entry.url;
            //console.log("attempting load of: "+entry+" with width: "+sensibleWidth);
            //$scope.addImage(imgUrl,sensibleWidth);

            $scope.addImageMyWay({
              imageIdx: icount,
              imageURL: imgUrl
            });

            icount++;
          });
        };
        // ===============
        $scope.determineLoadingWidth = function(containerWidth){
          var divisor = 4;
          if ($scope.images.length <= 4) divisor = $scope.images.length;
          if (divisor < 1) divisor = 1;
          return containerWidth/(divisor+1);
        };

        // ===============
        $scope.addImage = function(imgUrl, width){
          $scope.fabric.addImageScaledToWidth(imgUrl,width);
        };

        // add images (from the cart) and place them just so....
        // ... rows of 5 images
        $scope.addImageMyWay = function(options){
          var imageURL = options.imageURL;
          var sensibleWidth = Math.floor($scope.determineLoadingWidth(window.innerWidth));

          fabric.Image.fromURL(imageURL,function(image){
            var scale = sensibleWidth/image.width;
            var scaledHeight = image.height * scale;

            if (scaledHeight > $scope.maxHeight) {
              // the next row is governed as a multiple of the scaled max height
              $scope.maxHeight = scaledHeight;
            }
            var rowNum = Math.floor(options.imageIdx/5);
            var colNum = options.imageIdx % 5;

            image.top = $scope.maxHeight*rowNum;
            image.left = sensibleWidth*colNum;
            image.scaleToWidth(sensibleWidth);
            image.lockUniScaling = true;

            FabricCanvas.getCanvas().add(image);
          });
        }

        // ===================================================================
        // Event Handlers.
        // ===================================================================
        $scope.handleObjectAdded = function(evt){

        };
        $scope.handleObjectSelected = function(evt){
          // when an image is selected, we need to enable control buttons in the nav!
          var img = FabricCanvas.getCanvas().getActiveObject();
          if (img != null){
            //console.log("this was selected: "+evt.target);
            $scope.enableCropControls();
            // also bring the image to the front
            //console.log("bring the selected to the front!!!");
            img.bringToFront();
            if ($scope.showCaption) $scope.findCaption();
          }
        };
        $scope.handleCanvasClicked = function(evt){
          // when an image is selected, we need to enable control buttons in the nav!
          if (FabricCanvas.getCanvas().getActiveObject() == null){
            //console.log("canvas clicked, active object deselected!");
            $scope.disableCropControls();
            if ($scope.showCaption) $scope.findCaption();
          }
        };
        // disable/enable cropping controls is a matter of bootstrap css classing...
        $scope.disableCropControls = function(){
          $('#lb-crop-btn').addClass("disabled");
          $('#lb-trash-btn').addClass("disabled");
        };
        $scope.enableCropControls = function(){
          $('#lb-crop-btn').removeClass("disabled");
          $('#lb-trash-btn').removeClass("disabled");
        };
        $scope.cropButtonClicked = function(){
          // assumes activeObject is not null, could not click cropButton if that were the case!
          var imgSrc = FabricCanvas.getCanvas().getActiveObject().getSrc();
          var imgName = imgSrc.slice(imgSrc.lastIndexOf("/images/")+8);
          window.localStorage.setItem("cropper-image-to-crop", imgSrc);
          //console.log("So, you want to crop this: "+imgName);

          // parameter no longer required... setting it to 1
          window.open("/cropper/1",'_cropper');

        }
        $scope.trashButtonClicked = function(){
          //console.log("So, you want to remove this: "+FabricCanvas.getCanvas().getActiveObject());
          FabricCanvas.getCanvas().getActiveObject().remove();
          // TODO: consider removing the image from the cart?
          $scope.disableCropControls();
          alertFactory.add("warning","Image was removed!");
        }
        $scope.infoButtonClicked = function(){
          //console.log("So, you want to toggle captions....");
          alertFactory.add("success","Info button clicked!!!");
          $scope.showCaption = ! $scope.showCaption;
          //FabricCanvas.getCanvas().renderAll();
          $('#erdmanBody').focus();
        }
        $scope.saveButtonClicked = function(){
          //console.log("So, you want to save your work...");
          window.localStorage.setItem('saved-light-box',JSON.stringify(FabricCanvas.getCanvas()));
          alertFactory.add("success","Lightbox has been saved!");
        }
        $scope.loadButtonClicked = function(){
          console.log("So, you want to load previous work...");
          FabricCanvas.getCanvas().loadFromJSON(window.localStorage.getItem('saved-light-box'));
          alertFactory.add("success","Lightbox was loaded!");
        }
        $scope.clearButtonClicked = function(){
          //CartStorageService.clearCart(); // doesn't work!!!!!
          window.localStorage.setItem('cart-items-angularjs',[]);

          alertFactory.add("success","Lightbox cart was cleared!");
          // this works, marginally, need to update the gallery pages'
          // cart counter via refresh... no doubt there's a better way to do it.
        }
        // ===============> End of Event Handlers


        // ================================================================
      	// Editing Canvas Size
      	// ================================================================
      	$scope.selectCanvas = function() {
      		$scope.canvasCopy = {
      			width: $scope.fabric.canvasOriginalWidth,
      			height: $scope.fabric.canvasOriginalHeight
      		};
      	};

      	$scope.setCanvasSize = function() {
      		$scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
      		$scope.fabric.setDirty(true);
      		Modal.close();
      		delete $scope.canvasCopy;
      	};

      	$scope.updateCanvas = function() {
      		var json = $scope.fabric.getJSON();

      		$www.put('/api/canvas/' + $scope.canvasId, {
      			json: json
      		}).success(function() {
      			$scope.fabric.setDirty(false);
      		});
      	};

        $scope.$on('canvas:created', $scope.init);

    });
