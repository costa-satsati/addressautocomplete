sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var autocomplete;
	var addressMapping = {
		street_number: "HouseNumber",
		route: "Street",
		locality: "City",
		administrative_area_level_1: "State",
		country: "Country",
		postal_code: "ZIPCode"
	};

	return Controller.extend("qh.addressautocomplete.AddressAutocomplete.controller.AddressForm", {

		onInit: function () {

			var data = {
				HouseNumber: "",
				Street: "",
				City: "",
				State: "",
				Country: "",
				ZIPCode: ""
			};
			var oModel = new JSONModel(data);
			this.getView().setModel(oModel, "addressModel");
			//this.byId("autocomplete").attachBrowserEvent("onfocus", this._geolocate);
		},

		onAfterRendering: function () {
			autocomplete = new google.maps.places.Autocomplete(
				(this.byId('autocomplete').getDomRef('inner')), {
					types: ['geocode']
				});
			autocomplete.addListener('place_changed', function () {

				// Get the place details from the autocomplete object.
				var place = autocomplete.getPlace(),
					addressModel = this.getView().getModel("addressModel");

				// Get each component of the address from the place details
				// and fill the corresponding field on the form.
				for (var i = 0; i < place.address_components.length; i++) {
					var addressType = place.address_components[i].types[0];
					if (addressMapping[addressType]) {
						var val = place.address_components[i]["short_name"];
						addressModel.setProperty("/"+addressMapping[addressType],val);
					}
				}
			}.bind(this));
			this._geolocate();
		},

		/** 
		 * Private method to prompt for location
		 * @constructor 
		 */
		_geolocate: function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					var geolocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					var circle = new google.maps.Circle({
						center: geolocation,
						radius: position.coords.accuracy
					});
					autocomplete.setBounds(circle.getBounds());
				});
			}
		}

	});
});