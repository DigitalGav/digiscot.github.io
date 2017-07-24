$(document).ready(function(){
    var infowindow = new google.maps.InfoWindow();
    var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
    }
    var bounds = new google.maps.LatLngBounds();
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var postcodeChunks = [],
        size = 100,
        postcodeLookup = {},
        fetched = 0;

    while(postcodes.length > 0){
        postcodeChunks.push(postcodes.splice(0, size));
    }

    for(var i = 0; i < postcodeChunks.length; i++){
        $.post('https://api.postcodes.io/postcodes', { postcodes: postcodeChunks[i] }, function(data, status, xhr){
            for(var r = 0; r < data.result.length; r++){
                if(data.result[r].hasOwnProperty('result')){
                    var query = data.result[r].query;
                    var details = data.result[r].result;
                    postcodeLookup[query] = details;
                }
            }
            if(++fetched === postcodeChunks.length){
                postcodesLoaded();
            }
        });
    }

    function postcodesLoaded(){
        var heatmapPoints = [];

        for(let p = 0; p < projects.length; p++){
            if(postcodeLookup.hasOwnProperty(projects[p].postcode)){
                projects[p].geo = postcodeLookup[projects[p].postcode];
            }

            if(projects[p].geo && projects[p].geo.latitude){
                projects[p].contentString = '<a href="' + projects[p].permalink + '">' + projects[p].lead + '</a><br>' + projects[p].title;

                projects[p].marker = new google.maps.Marker({
                    position: new google.maps.LatLng(projects[p].geo.latitude, projects[p].geo.longitude),
                    map: map,
                });

                bounds.extend(projects[p].marker.position);

                google.maps.event.addListener(projects[p].marker, 'click', () => {
                    infowindow.setContent(projects[p].contentString);
                    infowindow.open(map, projects[p].marker);
                });

                heatmapPoints.push({
                    location: projects[p].marker.position,
                    weight: projects[p].award / 1000
                });
            }
        }

        //var heatmap = new google.maps.visualization.HeatmapLayer({
        //    data: heatmapPoints,
        //    map: map,
        //    radius: 50,
        //    opacity: 0.5,
        //    gradient: [
        //        'rgba(0, 150, 0, 0)',
        //        'rgba(0, 150, 0, 1)'
        //    ]
        //});

        map.fitBounds(bounds);
    }
});
