angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants) {
        $scope.fabric = {};
        $scope.loaded = 0;            // number of images loaded
      	$scope.FabricConstants = FabricConstants;

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

          // deal with cropping and cart changes ... we assume that the clients
          // browser supports localStorage (html5)
          window.addEventListener('storage',function(e){
            //console.log("storage event!"+e.type+":"+e.key+":"+e.newValue+":"+e.storageArea);
            if (e.key == 'cart-items-angularjs'){
              if (e.oldValue && (e.newValue.length > e.oldValue.length)){
                var cart = JSON.parse(e.newValue);
                var last = cart.pop();

                console.log("Item was added to the cart: "+last);

                $scope.addImage("/images/"+last,400);
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

        // ===================================================================
        // Methods dealing with loading images into fabric from the cart
        // ===================================================================
        $scope.loadFromCart = function(){
          var sensibleWidth = $scope.determineLoadingWidth(window.innerWidth);

          // TODO: when loading from cart, load into a "grid" that
          // has max 5 objects width.
          var icount = 0;
          $scope.images.forEach(function(entry){
            var imgUrl = '/images/' +entry;
            //console.log("attempting load of: "+entry+" with width: "+sensibleWidth);
            $scope.addImage(imgUrl,sensibleWidth);
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
        $scope.addImageMyWay = function(options){
          fabric.Image.fromURL(imageURL,function(object){

          });
        }

        // ===================================================================
        // Event Handlers.
        // ===================================================================
        $scope.handleObjectAdded = function(evt){
          // TODO: find out what's up with this... still adds to the middle!
          // also! this should only happen on initial loading of the page
          // if (evt.target instanceof fabric.Image){
          //   var itemsInCanvas = FabricCanvas.getCanvas().getObjects().length;
          //   console.log("there are now "+itemsInCanvas+" item(s) added to the canvas");
          //   //console.log(' >>> just added this: '+evt.target);
          //   var c = $scope.loaded % 5;
          //   var r = Math.floor($scope.loaded / 5);
          //   var vtop = (r * 50)+30;
          //   var vleft =  c* $scope.determineLoadingWidth(window.innerWidth);
          //   $scope.loaded++;
          //
          //   evt.target.setTop(vtop);
          //   evt.target.setLeft(vleft);
          //   evt.target.setCoords();
          //
          // }
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
          }
        };
        $scope.handleCanvasClicked = function(evt){
          // when an image is selected, we need to enable control buttons in the nav!
          if (FabricCanvas.getCanvas().getActiveObject() == null){
            //console.log("canvas clicked, active object deselected!");
            $scope.disableCropControls();
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
          console.log("So, you want to crop this: "+imgName);

          // works for image name... dataUrl will break this!
          window.open("/cropper/"+imgName,'_cropper');

          // TODO: a workaround is to pass the image name || dataUrl via more localStorage
          // have the cropper page use the value from localstorage.
        }
        $scope.trashButtonClicked = function(){
          console.log("So, you want to remove this: "+FabricCanvas.getCanvas().getActiveObject());
          FabricCanvas.getCanvas().getActiveObject().remove();
          // TODO: consider removing the image from the cart?
          $scope.disableCropControls();
        }
        $scope.infoButtonClicked = function(){
          console.log("So, you want to toggle captions...");
        }
        $scope.saveButtonClicked = function(){
          console.log("So, you want to save your work...");
          window.localStorage.setItem('saved-light-box',JSON.stringify(FabricCanvas.getCanvas()));
        }
        $scope.loadButtonClicked = function(){
          console.log("So, you want to load previous work...");
          FabricCanvas.getCanvas().loadFromJSON(window.localStorage.getItem('saved-light-box'));
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
