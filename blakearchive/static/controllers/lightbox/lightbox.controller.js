angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants,
      worktitleService
    ) {
        $scope.fabric = {};
        $scope.loaded = 0;            // number of images loaded
      	$scope.FabricConstants = FabricConstants;
        $scope.maxHeight = 0;
        $scope.showCaption= true;
        $scope.caption = null;
        $scope.focusedImage = null;

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
          FabricCanvas.getCanvas().on('mouse:over',$scope.handleMouseOver);
          FabricCanvas.getCanvas().on('mouse:out',$scope.handleMouseOut);
          $('#lb-crop-btn').on('click',$scope.cropButtonClicked);
          $('#lb-trash-btn').on('click',$scope.trashButtonClicked);
          $('#lb-info-btn').on('click',$scope.infoButtonClicked);
          $('#lb-save-btn').on('click',$scope.saveButtonClicked);
          $('#lb-load-btn').on('click',$scope.loadButtonClicked);
          $('#lb-clear-btn').on('click',$scope.clearButtonClicked);
          $('#loadfile').on('change',$scope.loadFileSelected);

          // deal with cropping and cart changes ... we assume that the clients
          // browser supports localStorage (html5)
          window.addEventListener('storage',function(e){
            //console.log("storage event!"+e.type+":"+e.key+":"+e.newValue+":"+e.storageArea);
            if (e.key == 'cart-items-angularjs'){
              if (e.oldValue && (e.newValue.length > e.oldValue.length)){
                var cart = JSON.parse(e.newValue);
                var last = cart.pop();

                //console.log("Item was added to the cart: "+JSON.stringify(last));

                //$scope.addImage(last.url,400);
                $scope.addImageMyWay({
                  imageIdx: 2,
                  imageURL: last.url,
                  imageCaption: last.title+": "+last.caption
                });

              }
            }else if (e.key == 'lbox-cropped-image'){
              if (e.newValue != null){
                console.log("An Image was cropped!");
                //$scope.addImage(e.newValue,400);

                $scope.addImageMyWay({
                  imageIdx: 2,
                  imageURL: e.newValue,
                  imageCaption: window.localStorage.getItem("cropper-image-to-crop-info")
                });
                // new method: add the cropped image to the cart.
                // it should be noted that the new value is no longer a dataUrl, instead
                // it is a cart item object with url, title, and caption....
                //CartStorageService.insert(JSON.parse(e.newValue));
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

          var icount = 0;
          $scope.images.forEach(function(entry){
            var imgUrl = entry.url;
            //console.log("attempting load of: "+entry+" with width: "+sensibleWidth);
            //$scope.addImage(imgUrl,sensibleWidth);

            $scope.addImageMyWay({
              imageIdx: icount,
              imageURL: imgUrl,
              imageCaption: entry.title+": "+entry.caption
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
        // $scope.addImage = function(imgUrl, width){
        //   $scope.fabric.addImageScaledToWidth(imgUrl,width);
        // };

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

            image.alt = options.imageCaption;
            console.log("image alt: "+JSON.stringify(image.alt));

            FabricCanvas.getCanvas().add(image.set({alt:options.imageCaption}));

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
          //console.log("selected alt: "+JSON.stringify(img.alt));
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
        $scope.handleMouseOver = function(evt){
          var t = evt.target;
          if (t instanceof fabric.Image){
            //console.log("Moused over image: "+t.alt);
            $scope.focusedImage = t;
            document.getElementById('caption').innerHTML = t.alt;
            document.getElementById('caption').style.display = 'block';
          }
        };
        $scope.handleMouseOut = function(evt){
          if (evt.target instanceof fabric.Image){
            //console.log("Moused out image: "+evt.target.alt);
            $scope.focusedImage = null;
            document.getElementById('caption').style.display = 'none';
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
          var ao = FabricCanvas.getCanvas().getActiveObject();

          window.localStorage.setItem("cropper-image-to-crop", ao.getSrc());
          window.localStorage.setItem("cropper-image-to-crop-info", ao.alt);
          //console.log("So, you want to crop this: "+imgName);

          // parameter no longer required... setting it to 1
          window.open("/cropper/crop",'_blank',"toolbar=no,scrollbars=yes,resizable=yes,width=1200,height=800");

        }
        $scope.trashButtonClicked = function(){
          //console.log("So, you want to remove this: "+FabricCanvas.getCanvas().getActiveObject());
          FabricCanvas.getCanvas().getActiveObject().remove();
          // TODO: consider removing the image from the cart?
          $scope.disableCropControls();
        }
        $scope.infoButtonClicked = function(){
          //console.log("So, you want to toggle captions....");
          $scope.showCaption = ! $scope.showCaption;
          //FabricCanvas.getCanvas().renderAll();
          $('#erdmanBody').focus();
        }
        $scope.saveButtonClicked = function(){
          //console.log("So, you want to save your work...");
          // the following saves data to the localStorage...
          //window.localStorage.setItem('saved-light-box',JSON.stringify(FabricCanvas.getCanvas()));

          // ... instead, we want to stream the data out as a download (text/json)
          // here's some js shenanigans I found...
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(FabricCanvas.getCanvas().toDatalessJSON(['alt'])));
          var dlAnchorElem = document.getElementById('saver');
          dlAnchorElem.setAttribute("href",     dataStr     );
          dlAnchorElem.setAttribute("download", "lightbox.json");
          dlAnchorElem.click();
        }
        $scope.loadButtonClicked = function(){
          //console.log("So, you want to load previous work...");
          //FabricCanvas.getCanvas().loadFromJSON(window.localStorage.getItem('saved-light-box'));

          $('#loadfile').click();

        }
        $scope.loadFileSelected = function(evt){
          var file = document.getElementById('loadfile').files[0]
          console.log("load file: "+file.name);
          var reader = new FileReader();
          reader.addEventListener("load",function(){
            console.log("file was read by the reader: "+reader.result);
            var canvas= FabricCanvas.getCanvas();
            FabricCanvas.getCanvas().loadFromJSON(reader.result,canvas.renderAll.bind(canvas), function(o, object) {
              object.lockUniScaling = true;
            });
          },false);

          if (file){
            reader.readAsText(file);
          }
        }

        $scope.clearButtonClicked = function(){
          //CartStorageService.clearCart(); // doesn't work!!!!!
          window.localStorage.setItem('cart-items-angularjs',[]);

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
