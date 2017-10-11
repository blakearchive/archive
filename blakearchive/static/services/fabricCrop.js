/*
  consolidate fabric cropping into this service for our sanity!

	-- not being used.... odd behaviors when using this service.
	I think I am mis-managing	state... there just shouldn't be
	any state in a service. sigh...
*/
angular.module('fabric.crop', [
	'common.fabric',
	'common.fabric.canvas'
])
.factory('FabricCrop', ['Fabric', 'FabricCanvas', '$rootScope',
	function(Fabric,FabricCanvas, $rootScope) {
  return function(options){
    var self = angular.extend({
			fabric:{},						// reference to fabric... pass it in please
			isCropMode:false,				// are we in crop mode?
			cropObject:null,				// the object currently being cropped
			cropBoxIsDrawn:false,		// the cropBox has been drawn?
			cropBoxIsDrawing:false,	// the cropbox is being drawn?
			cropBox:null,						// fabric Rect representing the cropping box
			mouseDown:null,					// tracks the mouse during cropbox sizing
			removeIcon:null,				// icon for the removing an image
			cropIcon:null,					// icon to toggle crop mode
			acceptIcon:null,				// icon to start the crop procedure
			cancelIcon:null,				// icon to cancel the crop procedure
			boundingBox:null				// boundingBox of the canvas... a DomRect
		},options);
		var spacing = 28;

    self.init = function(){
			if (self.boundingBox == null){
				self.boundingBox = {
					top: 0, left: 0
				}
			}

      // create the cropbox and add it to the canvas.
      self.cropBox = new fabric.Rect({
        fill: 'transparent',
        stroke: '#29f',
        strokeWidth: 3,
        selectable: true,
        //strokeDashArray: [1, 1],
        visible: false
      });
      self.fabric.canvas.add(self.cropBox);

			// setup icons to be used as control "buttons"... crop, remove, accept, cancel...
      self.cropIcon=fabric.Image.fromURL('/icon/crop-symbol.png',function(oImg){
        oImg.visible = true; // icon is initially hidden!
				oImg.selectable = false;
				oImg.left = spacing * 2;

				// handle mouse click of the crop icon...
				oImg.on('mousedown',function(evt){
					console.log("u clicked the crop button!");
					// calls methods to toggle cropMode
					if (!self.isCropMode)
						self.enterCropMode();
					else
						self.exitCropMode();
				});
				self.fabric.canvas.add(oImg);
				//self.fabric.canvas.add(oImg);
      });

      self.removeIcon=fabric.Image.fromURL('/icon/dustbin.png',function(oImg){
        oImg.visible = true; // icon is initially hidden!
				oImg.selectable = false;
				oImg.left = spacing * 3;
				oImg.on('mousedown',function(evt){
					console.log("yay! remove was clicked!")
				});
				self.fabric.canvas.add(oImg);
				//self.fabric.canvas.add(oImg);
      });

			self.acceptIcon=fabric.Image.fromURL('/icon/273-checkmark.png',function(oImg){
        oImg.visible = true; // icon is initially hidden!
				oImg.width = 22;
				oImg.height = 22;
				oImg.left = 0;
				oImg.selectable = false;
				oImg.on('mousedown',function(evt){
					console.log("yay! accept was clicked!")
				});
				self.fabric.canvas.add(oImg);
				//self.fabric.canvas.add(oImg);
      });
			self.cancelIcon=fabric.Image.fromURL('/icon/272-cross.png',function(oImg){
        oImg.visible = true; // icon is initially hidden!
				oImg.width = 22;
				oImg.height = 22;
				oImg.selectable = false;
				oImg.left = spacing;
				oImg.on('mousedown',function(evt){
					console.log("yay! cancel was clicked!")
				});
				self.fabric.canvas.add(oImg);
				//self.fabric.canvas.add(oImg);
      });

			console.log("fc canvas: "+self.fabric.canvas.toString());

			self.fabric.canvas.on('mouse:down',self.handleMouseDown);
			self.fabric.canvas.on('mouse:move',self.handleMouseMove);
			self.fabric.canvas.on('mouse:up',self.handleMouseUp);
    }; // end of self.init()

		self.enterCropMode = function(){
			self.isCropMode = true;
			// need a reference to the object we want to crop...
			self.cropObject = self.fabric.canvas.getActiveObject();
			console.log("crop object on entry: "+self.cropObject);
			// make all fabric objects (if it isnt a control icon) non-selectable...
			self.fabric.canvas.forEachObject(function(o){
				if (o instanceof fabric.Image && !self.isAnIcon(o))
					o.selectable = false;
			});

			// because we will unselect everything
			self.fabric.canvas.deactivateAllWithDispatch();
		}

		self.exitCropMode = function(){
			self.cropMode = false;
			self.fabric.canvas.forEachObject(function(o){
				if (o instanceof fabric.Image && !self.isAnIcon(o))
					o.selectable = true;
			});
			console.log("crop object on exit: "+self.cropObject)
			self.fabric.canvas.setActiveObject(self.cropObject);
			self.cropObject = null;
		}

		// our icons for controls are images... read the image source
		// and if they have 'icon' in the url, then it is an icon
		// TODO: fix regex look for '/icon' -- since normal images may have 'icon'
		// in the path!!!!
		self.isAnIcon = function(o){
			return o.toString().match(/icon/g);
		}

    self.handleMouseDown = function(evt){
			self.mouseDown = evt;
      if (self.isCropMode && !self.cropBoxIsDrawn){
        //self.cropBox.width = 2;
        //self.cropBox.height = 2;
        // TODO: analyze and fix the boundingBox... maybe the boundingBox should
        // be the image instead of the canvas (possible?)... and should be
        // passed in as an arg.
				self.cropBoxIsDrawing = evt.e;

        self.cropBox.left = evt.e.pageX - self.boundingBox.left;
        self.cropBox.top = evt.e.pageY - self.boundingBox.top;
        self.cropBox.visible = true;
        self.cropBox.selectable = true;
        self.cropBox.lockRotation = true;
        self.fabric.canvas.bringToFront(self.cropBox);
        self.fabric.canvas.setActiveObject(self.cropBox);
        self.cropBoxIsDrawn = true;
      };
    };

    self.handleMouseMove = function(evt){
      // if the mouse is down and it is in cropMode...
      // resize the cropbox as the user is drawing it.
      // NOTE: this supports dragging lr,tb... find algorithm
      // to support arbitrary dragging!!!!
      if (self.isCropMode && self.cropBoxIsDrawing){
        self.cropBox.width = evt.e.pageX - self.mouseDown.pageX;
        self.cropBox.height = evt.e.pageY - self.mouseDown.pageY;
        self.fabric.canvas.bringToFront(self.cropBox);
        //self.fabric.canvas.renderAll();
      };
    };

    self.handleMouseUp = function(evt){
      self.cropBoxIsDrawing = false;
    };

    self.init();
    return self;
	};
}]);
