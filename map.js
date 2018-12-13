let map,
	geocoder,
	marker,
	infowindow;

function initMap() {
	const location = {
		lat: 39.8282,
		lng: -98.5795
	};

	// update globals
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 4,
		center: location
	});

	geocoder = new google.maps.Geocoder();

	marker = new google.maps.Marker({
		map: map,
	});

	infowindow = new google.maps.InfoWindow();

	//set up map
	map.data.loadGeoJson("retail-map.geojson");

	//apply custom markers
	map.data.setStyle(function (feature) {
		return { icon: feature.getProperty('icon') };
	});

	//add infowindow listener
	map.data.addListener('click', function (event) {
		const popUpHTML = `
			<div class="popUp">
			 	<div class='title'>${event.feature.getProperty("store")} #${event.feature.getProperty("store_id")} - ${event.feature.getProperty("display_name")}</div>
			 	<div class='address'>${event.feature.getProperty("address")}</div>
			 	<div class="address_2">${event.feature.getProperty("city")}, ${event.feature.getProperty("state")} ${event.feature.getProperty("zip")}</div>
		 	</div>
		`;
		infowindow.setContent(popUpHTML);
		// position the infowindow on the marker
		infowindow.setPosition(event.feature.getGeometry().get());
		// anchor the infowindow on the marker
		infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
		infowindow.open(map);
	});
}

$(document).ready(function () {
	$("#search").on("submit", function (e) {
		e.preventDefault();

		const $ele = $(this),
			$search = $ele.find("[type='search']"),
			$amazon = $("#amazon_details"),
			zipcode = $search.val(),
			eligibility = prime[zipcode],
			translate = {
				free_one_day: "free one-day shipping",
				free_same_day: "free same-day shipping",
				free_two_day: "free two-day shipping"
			},
			zip_valid = /\d{5}/.test(zipcode);

		let text;

		if (!zip_valid) {
			text = "Please enter a valid 5-digit zipcode";
		} else {
			if (!eligibility) {
				text = "Amazon does not currently offer free same-day, one-day or two-day shipping for this zipcode";
			} else {
				text = `Amazon provides ${translate[eligibility]} in this area`;
			}
		}

		$amazon.text(text);
		$amazon.addClass("active");

		if (!zip_valid) {
			return false;
		}

		//convert zipcode to lat/lon
		geocoder.geocode({ address: zipcode }, function (results, status) {
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location);
				map.setZoom(12);
				marker.setPosition(results[0].geometry.location);
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	});

	$("#search input").on("keyup keydown keypress", function (e) {
		if (e.keyCode <= 57 && e.keyCode >= 48) {
			$("#amazon_details.active").removeClass("active");
		}
	});
});