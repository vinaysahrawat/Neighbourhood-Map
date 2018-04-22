//data of the locations mentioned
var dataofPlaces = [{
        title: 'Taj Hotel',
        location: {
            lat: 30.7455624,
            lng: 76.7830271
        },
        show: true,
        selected: false,
        venueId: '4bc8db62762beee1d69a3d38'
    },
    {
        title: 'Rock Garden',
        location: {
            lat: 30.7524071,
            lng: 76.8006932
        },
        show: true,
        selected: false,
        venueId: '4b6fe660f964a5206dff2ce3'
    },
    {
        title: 'Rose Garden',
        location: {
            lat: 30.7475026,
            lng: 76.7820522
        },
        show: true,
        selected: false,
        venueId: '4c0ba827009a0f47975cebbf'
    },
    {
        title: 'Capitol Complex',
        location: {
            lat: 30.7591328,
            lng: 76.7955279
        },
        show: true,
        selected: false,
        venueId: '4c3c02b37d002d7f19efad18'
    },
    {
        title: 'Panjab University',
        location: {
            lat: 30.7600747,
            lng: 76.7641141
        },
        show: true,
        selected: false,
        venueId: '4cb5e43664998cfa354911a2'
    },
    {
        title: 'Elante Mall',
        location: {
            lat: 30.7060654,
            lng: 76.7986131
        },
        show: true,
        selected: false,
        venueId: '5114cd90e4b06bb0ed15a97f'
    },
    {
        title: 'Leisure Valley',
        location: {
            lat: 30.7527935,
            lng: 76.7898882
        },
        show: true,
        selected: false,
        venueId: '4dc014a6043706a0320ce424'
    },
    {
        title: 'JW Marriot',
        location: {
            lat: 30.726705,
            lng: 76.7649463
        },
        show: true,
        selected: false,
        venueId: '4dff0926d4c00c69c14b292a'
    }
];


var model = function()
{
    var x = this;
    x.displayError = ko.observable('');
    x.arrayMap = [];

    for (var i = 0; i < dataofPlaces.length; i++) {
        var place = new google.maps.Marker({
            position: {
                lat: dataofPlaces[i].location.lat,
                lng: dataofPlaces[i].location.lng
            },
            map: map,
            title: dataofPlaces[i].title,
            show: ko.observable(dataofPlaces[i].show),
            selected: ko.observable(dataofPlaces[i].selected),
            venueid: dataofPlaces[i].venueId, // venue id from foursquare
            animation: google.maps.Animation.DROP
        });
        x.arrayMap.push(place);
    }


    // function for animation of markers
    x.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 500);
    };

    // function to add API info to each marker
    x.addApiInfo = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.venueid + '?client_id=CCZQELAVUD3U1YNBNR1WPDRUPFFPXZAERXL05QY24MMHINOS&client_secret=KT2BR1PYYPWSOVBZCY1V1AAVRITVZ0JZNZ0YLVBLP0ZQH3MM&v=20170208',
            dataType: "json",
            success: function(data) {
                // displays likes and ratings of selected marker
                var result = data.response.venue;
                // add likes and ratings to marker
                marker.likes = result.hasOwnProperty('likes') ? result.likes.summary : '';
                marker.rating = result.hasOwnProperty('rating') ? result.rating : '';
            },
            // displays warning if there is error in recieving json
            error: function(e) {
                x.displayError("Foursquare data is unavailable. Please try again later.");
            }
        });
    };


    //function to add information about API to the markers
    var addMarkerInfo = function(marker) {

        //adds API items to each marker
        x.addApiInfo(marker);
        //adds the click event listener to marker
        marker.addListener('click', function() {
        //set this marker to the selected state
        x.setSelected(marker);
        });
    };


    //  iterate through arrayMap and add marker api info
    for (var i = 0; i < x.arrayMap.length; i++) {
        addMarkerInfo(x.arrayMap[i]);
    }


    // create a searchText for the input search field
    x.searchText = ko.observable('');
    //every keydown is called from input box
    x.filterList = function() {
        //variable for search text
        var currentText = x.searchText();
        infowindow.close();

        //list for user search
        if (currentText.length === 0) {
            x.setAllShow(true);
        } else {
            for (var i = 0; i < x.arrayMap.length; i++) {
                // to check whether the searchText is there in the arrayMap
                if (x.arrayMap[i].title.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    x.arrayMap[i].show(true);
                    x.arrayMap[i].setVisible(true);
                } else {
                    x.arrayMap[i].show(false);
                    x.arrayMap[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // to show all the markers
    x.setAllShow = function(marker) {
        for (var i = 0; i < x.arrayMap.length; i++) {
            x.arrayMap[i].show(marker);
            x.arrayMap[i].setVisible(marker);
        }
    };
    // function to make all the markers unselected
    x.setAllUnselected = function() {
        for (var i = 0; i < x.arrayMap.length; i++) {
            x.arrayMap[i].selected(false);
        }
    };

    x.currentLoc = x.arrayMap[0];

    // function to make all the markers selected and show the likes and ratings

    x.setSelected = function(location) {
        x.setAllUnselected();
        location.selected(true);

        x.currentLoc = location;

        Likes = function() {
            if (x.currentLoc.likes === '' || x.currentLoc.likes === undefined) {
                return "Likes not available for this location";
            } else {
                return "Location has " + x.currentLoc.likes;
            }
        };
        // function to show rating and if not then no rating to display
        Rating = function() {
            if (x.currentLoc.rating === '' || x.currentLoc.rating === undefined) {
                return "No ratings available!";
            } else {
                return "Rating: " + x.currentLoc.rating;
            }
        };

        var InfoWindow = "<h5>" + x.currentLoc.title + "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        x.Bounce(location);
    };
};
