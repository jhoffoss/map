var featureGroup;




function init() {

    L.mapbox.accessToken = 'pk.eyJ1IjoiamhvZmZvc3MiLCJhIjoiY2lvenl4ODlvMDJnZnVmbTQ1N3VidGJ1MiJ9.AFJKraYeK_3XJilCZBQ8KA';
    window.map = L.mapbox.map('map', 'mapbox.outdoors').setView([lat, lon], zoom);

    window.toggle = false;

	navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords["latitude"];
			var lng = position.coords["longitude"];
			console.log(lat + "," + lng);
			map.setView([lat,lng],14);

			var starIcon = L.icon({
				iconUrl: 'images/icons/location-icon.png',
				iconSize: [25, 25],
				iconAnchor: new L.Point(12,25),
				popupAnchor: [0, -25]
			})
			var locationMarker = L.marker([lat, lng], {icon: starIcon}).bindPopup("You are here");
			locationMarker.addTo(map);
			locationMarker.on('mouseover', function(){
				this.openPopup();
			});
			locationMarker.on('mouseout', function(){
				this.closePopup();
			});
		},
		function (error) {
			console.log("Error: ", error);
		},
		{
			enableHighAccuracy: true
		}
	);

	var groundLayers    = L.geoJson(groundData);//.bindPopup('This is Littleton, CO.');
	var	airLayers       = L.geoJson(airData);//.bindPopup('This is Littleton, CO.');
	var	waterLayers     = L.geoJson(waterData);//.bindPopup('This is Littleton, CO.');
	var	evidenceLayers  = L.geoJson(evidenceData);//.bindPopup('This is Littleton, CO.');

	groundLayers.eachLayer(function(layer){
		var popUpData =
			'<div class="popUpFormatting">'+
			'<h3>Ground Search: ' + (LGeo.area(layer) / 100000).toFixed(2) + 'km<sup>2</sup></h3>' +
			'<span class="popUpTitle">Searched by: </span>' + layer.feature.properties.teamName + '<br>' +
			'<span class="popUpTitle">Date: </span>'+ layer.feature.properties.dateTime + '<br>' +
			'<span class="popUpTitle">Details: </span>' + layer.feature.properties.miscDetails + '<br>';
		if(role == 2){
			popUpData = popUpData + '' +
				'<a href="/deleteById?uid=' + layer.feature.properties.id + '" id="deleteEv">[DELETE]</a></div>';
		} else {
			popUpData = popUpData +
				'</div>';
		}
			layer.bindPopup(popUpData);
			layer.setStyle({color: "#663300"});
		});

	airLayers.eachLayer(function(layer){
		var popUpData =
			'<div class="popUpFormatting">'+
			'<h3>Air Search: ' + (LGeo.area(layer) / 100000).toFixed(2) + 'km<sup>2</sup></h3>' +
			'<span class="popUpTitle">Searched by: </span>' + layer.feature.properties.teamName + '<br>' +
			'<span class="popUpTitle">Date: </span>'+ layer.feature.properties.dateTime + '<br>' +
			'<span class="popUpTitle">Details: </span>' + layer.feature.properties.miscDetails + '<br>';
		if(role == 2){
			popUpData = popUpData + '' +
				'<a href="/deleteById?uid=' + layer.feature.properties.id + '" id="deleteEv">[DELETE]</a></div>';
		} else {
			popUpData = popUpData +
				'</div>';
		}
			layer.bindPopup(popUpData);
			layer.setStyle({color: "#ff33cc"});
		});

	waterLayers.eachLayer(function(layer){
		var popUpData =
			'<div class="popUpFormatting">'+
			'<h3>Water Search: ' + (LGeo.area(layer) / 100000).toFixed(2) + 'km<sup>2</sup></h3>' +
			'<span class="popUpTitle">Searched by: </span>' + layer.feature.properties.teamName + '<br>' +
			'<span class="popUpTitle">Date: </span>'+ layer.feature.properties.dateTime + '<br>' +
			'<span class="popUpTitle">Details: </span>' + layer.feature.properties.miscDetails + '<br>';
		if(role == 2){
			popUpData = popUpData + '' +
				'<a href="/deleteById?uid=' + layer.feature.properties.id + '" id="deleteEv">[DELETE]</a></div>';
		} else {
			popUpData = popUpData +
				'</div>';
		}
		layer.bindPopup(popUpData);
		layer.setStyle({color:"#0000ff"});
	});


	evidenceLayers.eachLayer(function(layer){
		var feature = layer.feature = layer.feature || {};
		console.log(layer.feature.properties);
		layer.setIcon(L.icon(feature.properties.icon));
		var popUpData =
			'<div class="popUpFormatting">'+
			'<h3>Evidence: </h3>' +
			'<span class="popUpTitle">Found by: </span>' + layer.feature.properties.teamName + '<br>' +
			'<span class="popUpTitle">Date: </span>'+ layer.feature.properties.dateTime + '<br>' +
			'<span class="popUpTitle">Type of Evidence: </span>' + layer.feature.properties.evType +'<br>' +
			'<span class="popUpTitle">Details: </span>' + layer.feature.properties.evDetails +'<br>' +
			'<span class="popUpTitle">Image: </span><br>';

		if(role == 2){
			popUpData = popUpData + '' +
				'<a id="changeEvPhoto" class="overlayLink" href="#" data-action="addEvidenceImage?uid=' + layer.feature.properties.id + '" onclick="changeEvPhoto()">' +
				'<img src="' + layer.feature.properties.imageURL +
				'" alt="' + layer.feature.properties.miscDetails + '" width="100%" title="Click to change image"></a><br>' +
				'<a href="'+  layer.feature.properties.imageURL +'" target="_blank" style="margin-left:calc(50% - 36px)">' +
				'(view full size)</a><br>' +
				'<a href="/deleteById?uid=' + layer.feature.properties.id + '" id="deleteEv">[DELETE]</a></div>';
		} else {
			popUpData = popUpData +
				'<img src="' + layer.feature.properties.imageURL +
				'" alt="' + layer.feature.properties.miscDetails + '" width="100%"><br>' +
				'</div>';
		}

		layer.bindPopup(popUpData);
	});

	var ground = L.layerGroup([groundLayers]),
		air = L.layerGroup([airLayers]),
		water = L.layerGroup([waterLayers]),
		evidence = L.layerGroup([evidenceLayers]);

	L.control.layers({
		'Normal View': L.mapbox.tileLayer('mapbox.outdoors').addTo(map),
		'Satellite View': L.mapbox.tileLayer('mapbox.satellite')
	}, {
		'Ground': ground,
		'Air': air,
		'Water':water,
		'Evidence': evidence
	}).addTo(map);

	L.featureGroup([ground,air,water,evidence]).addTo(map);


	L.Draw.Water = L.Draw.Polygon.extend({
		statics : {
			TYPE : 'water'
		},
		options : {
			shapeOptions: {
				color: 'blue'
			},
			allowIntersection: false,
			drawError: {
				color: 'orange',
				timeout: 1000
			},
			showArea: true,
			metric: false,
			repeatMode: true

		},

		initialize: function (map, options) {
			// Save the type so super can fire, need to do this as cannot do this.TYPE :(
			this.type = L.Draw.Water.TYPE;

			L.Draw.Feature.prototype.initialize.call(this, map, options);
		}

	});

	L.Draw.Air = L.Draw.Polygon.extend({
		statics : {
			TYPE : 'air'
		},
		options : {
			options : {
				shapeOptions: {
					color: 'green'
				},
				allowIntersection: false,
				drawError: {
					color: 'red',
					timeout: 1000
				},
				showArea: true,
				metric: false,
				repeatMode: true
			},
		},

		initialize: function (map, options) {
			// Save the type so super can fire, need to do this as cannot do this.TYPE :(
			this.type = L.Draw.Air.TYPE;

			L.Draw.Feature.prototype.initialize.call(this, map, options);
		}

	});

	L.Draw.Ground = L.Draw.Polygon.extend({
		statics : {
			TYPE : 'ground'
		},
		options : {
			shapeOptions: {
				color: 'brown'
			},
			allowIntersection: false,
			drawError: {
				color: 'red',
				timeout: 1000
			},
			showArea: true,
			metric: false,
			repeatMode: true
		},

		initialize: function (map, options) {
			// Save the type so super can fire, need to do this as cannot do this.TYPE :(
			this.type = L.Draw.Ground.TYPE;

			L.Draw.Feature.prototype.initialize.call(this, map, options);
		}

	});

	L.Draw.Evidence = L.Draw.Marker.extend({
		statics : {
			TYPE : 'evidence'
		},
		options : {
			icon : new L.icon({
				iconUrl: "/images/icons/add-evidence-large.png",
				iconAnchor: new L.Point(23,44),
			}),
			repeatMode : false,
			zIndexOffset : 5000		// This should be > than the highest z-index any markers
		},

		initialize: function (map, options) {
			// Save the type so super can fire, need to do this as cannot do this.TYPE :(
			this.type = L.Draw.Evidence.TYPE;

			L.Draw.Feature.prototype.initialize.call(this, map, options);
		}

	});

	L.DrawToolbar.prototype.options={
		water : {},
		air : {},
		ground : {},
		evidence : {},
		uploadTrace: {}
	};

	L.DrawToolbar.prototype.getModeHandlers= function (map) {
		return [
			{
				enabled: this.options.ground,
				handler: new L.Draw.Ground(map, this.options.ground),
				title: L.drawLocal.draw.toolbar.buttons.ground
			},
			{
				enabled: this.options.air,
				handler: new L.Draw.Air(map, this.options.air),
				title: L.drawLocal.draw.toolbar.buttons.air
			},
			{
				enabled: this.options.water,
				handler: new L.Draw.Water(map, this.options.water),
				title: L.drawLocal.draw.toolbar.buttons.water
			},
			{
				enabled: this.options.evidence,
				handler: new L.Draw.Evidence(map, this.options.evidence),
				title: L.drawLocal.draw.toolbar.buttons.evidence
			}

		];
	};

    //---------------------------------------------------------------------
	featureGroup = L.featureGroup().addTo(map);

	if(role == 0) {
		var drawFeatures = new L.Control.Draw({
			edit: false,
			draw: false
		}).addTo(map);
	} else if(role == 1 || role == 2) {
		var drawFeatures = new L.Control.Draw({
			edit: false,
			draw: {
				air: true,
				ground: true,
				water: true,
				evidence:true
			}
		}).addTo(map);

		map.on('draw:created', showPolygonArea);
	}

	function showPolygonArea(e) {

		var uid = sid + "-" + Date.now();
	    var type = e.layerType;
	    var layer = e.layer;

		var feature = layer.feature = layer.feature || {};
		feature.type = "Feature";
		feature.properties = feature.properties || {};
	    var shape = layer.toGeoJSON();
	    var shape_for_db = JSON.stringify(shape).replace(/&quot;/g,'"');

		console.log(shape_for_db);
		if(type == "evidence") {
			var popUp = '' +
				'<div class="mapLayerObjectBox" style="height:272px;width:182px;">' +
					'<form class="mapLayerObject" name="addToMap" id="addToMap" method="post" action="/addtomap">' +
					'<input class="mapLayerObject" type="hidden" name="uid" id="uid" value="' + uid + '">' +
					'<input class="mapLayerObject" type="hidden" name="type" id="type" value="' + type + '">' +
					'<input class="mapLayerObject" type="hidden" name="imageURL" id="imageURL" value="/images/upload/placeholder2.png">' +
					'Found by: <br><input class="mapLayerObject" type="text" name="teamName" id="teamName" required value="" placeholder="Enter Team Name or Number">' +
					'On: <br><input class="mapLayerObject" type="datetime-local" name="dateTime" id="dateTime" required value="">' +
					'Type of Evidence: <br><input class="mapLayerObject" type="text" name="evType" id="evType" required value="" placeholder="ex: Clothing, Food Wrapper, Backpack">' +
					'Description and Details: <br><textarea class="mapLayerObject" type="text" name="details" id="details" required placeholder="Please be as descriptive of possible">' +
					'</textarea><br><textarea id="dbShape" name="dbShape" style="display:none;">' + shape_for_db + '</textarea>' +
					'<span class="mapLayerObjectButtons">' +
					'<button class="overlayLink" id="evdSubmit" type="submit">Submit</button>' +
					'</span></a></form>' +
				'</div>';
		} else {
			var popUp = '' +
				'<div class="mapLayerObjectBox">' +
					'<form class="mapLayerObject" name="addToMap" id="addToMap" method="post" action="/addtomap">' +
					'<input class="mapLayerObject" type="hidden" name="uid" id="uid" value="' + uid + '">' +
					'<input class="mapLayerObject" type="hidden" name="type" id="type" value="' + type + '">' +
					'<p class="mapLayerObject">' +
					'Searched By:<br><input class="mapLayerObject" id="teamName" name="teamName" type="text" value="Team Llama">' +
					'<br>On:<br><input class="mapLayerObject" id="dateTime" name="dateTime" type="datetime-local">' +
					'<br>Details:' +
					'<textarea id="dbShape" name="dbShape" style="display:none;">' + shape_for_db + '</textarea>' +
					'<br><textarea name="details" id="details" class="mapLayerObjectTextarea" placeholder="Enter any details on the search">test!</textarea>' +
					'<span class="mapLayerObjectButtons">' +
					'<button class="overlayLink" id="areaSubmit" type="submit">Submit</button>' +
					'</span></a></form>' +
				'</div>';
		}

		featureGroup.addLayer(layer);
		layer.bindPopup(popUp);
		layer.openPopup();
    }

}

window.onload = init();
