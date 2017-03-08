angular.module('blake')
	.factory('CartStorageService',function($http, $injector){
		// taken from todo-mvc example project.
		// there used to be a choice between an api or localstorage
		// I've taken out the 'api' option. This service could be greatly
		// simplified, however... leaving it will allow us to add other storage
		// methods should we want to do so.  (using redis to store state for example).
		// appropriated from https://github.com/tastejs/todomvc/blob/gh-pages/examples/angularjs/js/services/cartItemstorage.js
		return $injector.get('localStorage');
	})
	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'cart-items-angularjs';

		var store = {
			cartItems: JSON.parse(localStorage.getItem(STORAGE_ID) || '[]'),

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (cartItems) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(cartItems));
			},
			// todos had a completed flag. we have no use for that but we do
			// have the need to clear out our cart so, i'll rename it clearCart and 
			// set the cartItems to a (new) empty list.
//			clearCompleted: function () {
//				var deferred = $q.defer();
//
//				var incompletecartItems = store.cartItems.filter(function (cartItem) {
//					return !cartItem.completed;
//				});
//
//				angular.copy(incompletecartItems, store.cartItems);
//
//				store._saveToLocalStorage(store.cartItems);
//				deferred.resolve(store.cartItems);
//
//				return deferred.promise;
//			},
			clearCart: function () {
				var deferred = $q.defer();
				
				//store.cartItems = [];
				// perhaps this is better than a new empty list...
				store.cartItems.clear();

				store._saveToLocalStorage(store.cartItems);
				deferred.resolve(store.cartItems);

				return deferred.promise;
			},

			delete: function (cartItem) {
				var deferred = $q.defer();

				store.cartItems.splice(store.cartItems.indexOf(cartItem), 1);

				store._saveToLocalStorage(store.cartItems);
				deferred.resolve(store.cartItems);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.cartItems);
				deferred.resolve(store.cartItems);

				return deferred.promise;
			},

			insert: function (cartItem) {
				var deferred = $q.defer();

				store.cartItems.push(cartItem);

				store._saveToLocalStorage(store.cartItems);
				deferred.resolve(store.cartItems);

				return deferred.promise;
			},

			put: function (cartItem, index) {
				var deferred = $q.defer();

				store.cartItems[index] = cartItem;

				store._saveToLocalStorage(store.cartItems);
				deferred.resolve(store.cartItems);

				return deferred.promise;
			},
			// this gets a count of items in the cart
			count: function (){
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.cartItems);
				deferred.resolve(store.cartItems.length);

				return deferred.promise;
			}
		};

		return store;
	});