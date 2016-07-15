$(document).ready(function () {
	$('.drawer').drawer();
});

L.mapbox.accessToken = 'pk.eyJ1IjoiamhvZmZvc3MiLCJhIjoiY2lvenl4ODlvMDJnZnVmbTQ1N3VidGJ1MiJ9.AFJKraYeK_3XJilCZBQ8KA';

var map = L.mapbox.map('map', 'mapbox.streets')
	.setView([44.8298, -93.3317], 15);

var featureGroup = L.featureGroup().addTo(map);

var drawFeatures = new L.Control.Draw({
	edit: {
		featureGroup: featureGroup
	},
	draw: {
		polygon: {
			shapeOptions: {
				color: 'purple'
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
		polyline: false,
		rectangle: {
			shapeOptions: {
				color: 'brown'
			},
			showArea: true,
				metric: false,
				repeatMode: true
		},
		circle: {
			shapeOptions: {
				color: 'green'
			},
			showArea: true,
			metric: false,
			repeatMode: true
		},
		marker: true
	}
}).addTo(map);

map.on('draw:created', showPolygonArea);
map.on('draw:edited', showPolygonAreaEdited);

function showPolygonAreaEdited(e) {
	e.layers.eachLayer(function(layer) {
		showPolygonArea({ layer: layer });
	});
}
function showPolygonArea(e) {
	var popUp = '<div class="mapLayerObjectBox"><p class="marker-title" style="text-align: center;font-size: 16pt;">' +
		(LGeo.area(e.layer) / 1000000).toFixed(2) + ' km<sup>2</sup> searched</p>' +
		'By <input class="mapLayerObject" type="text" value="TEAM LLAMA">' +
		'<br>On <input class="mapLayerObject" type="datetime-local">' +
		'<br>Details:' +
		'<br><textarea class="mapLayerObjectTextarea"></textarea>' +
		'<span class="mapLayerObjectButtons">' +
		'<a href="#" class="mapLayerObjectLink"><img src="../images/icons/ic_delete_forever_black_48dp_1x.png" style="float: left;"></a>' +
		'<a href="#" class="mapLayerObjectLink"><img src="../images/icons/ic_add_a_photo_black_48dp_1x.png" style="margin-left:64px;"></a>' +
		'<a href="#" class="mapLayerObjectLink"><img src="../images/icons/ic_add_circle_black_48dp_1x.png" style="float: right"></span></a>' +
		'</div>'
	featureGroup.addLayer(e.layer);
	e.layer.bindPopup(popUp);
	e.layer.openPopup();


}
