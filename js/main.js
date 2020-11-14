function getBudget(){
    return parseInt(document.getElementById("myRange").value);
}

window.onload = function() {
    if(document.getElementById("myRange")){
        document.getElementById("myRange").addEventListener('input', function() {
            document.getElementById("budget").value = "$" + getBudget().toLocaleString();
        });

        document.getElementById("budget").addEventListener('input', function() {
            var str = document.getElementById("budget").value;
            if(str.length > 0){
                document.getElementById("myRange").value = parseInt(document.getElementById("budget").value.replace("$", "").replace(",", "")).toLocaleString();
            }
        });
    }

    var x = document.getElementById("from");
    if(x){
        var d = new Date();
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        var yy = d.getFullYear();
        dd = String(dd).padStart(2, '0');
        mm = String(mm).padStart(2, '0');
        x.value = yy + '-' + mm + '-' + dd;
    }
};

function test(){
}
function wikiSearch(){
    document.getElementById("matches").innerHTML = "Looking for destination description...";

    (async () => {
        
        console.log(document.getElementById("destination").value); 
        
    })()
}
function poiSearch(){
    document.getElementById("matches").innerHTML = "Looking for matching attractions...";

    (async () => {

        var sel = document.getElementById("initial");
        var location = sel.options[sel.selectedIndex].text;

        var tags = [];
        
        if(document.getElementById("category-restaurant").value != "")
            tags.push(document.getElementById("category-restaurant").value);

        if(document.getElementById("category-attraction").value != "")
            tags.push(document.getElementById("category-attraction").value);

        if(document.getElementById("category-transportation").value != "")
            tags.push(document.getElementById("category-transportation").value);

        console.log(tags);

        if(tags.length == 0){
            document.getElementById("matches").innerHTML = "No criteria selected.";
            return;
        }

        var response = await queryPOI(location, tags, 10, "-score", ["name,intro,snippet,score"]);
        console.log(response);

        var displayStr = "";
        var i = 0;

        if(response.results.length == 0){
            document.getElementById("matches").innerHTML = "No matches found.";
            return;
        }

        for(var poi of response.results) {
            displayStr += "<p>" + `<h3>${poi.name}: <span style='font-size:16px;font-weight:normal'>${poi.snippet}</span></h3><br><br>${poi.intro}</p>`
            i++;
        }

        document.getElementById("matches").innerHTML = displayStr;
    })()
}

function hotelSearch(){
    document.getElementById("matches").innerHTML = "Looking for matching hotels...";
    (async () => {

        var checkIn = document.getElementById("from").value;
        var checkOut = document.getElementById("to").value;
        if(checkOut.length == 0)
        checkOut = null;

        var guests = document.getElementById("Guests").value;

        var stars = [];
        for(var s of ["five", "four", "three", "two", "one"]){
            if(document.getElementById(s+"star").checked)
                stars.push(document.getElementById(s+"star").value);
        }

        var location = document.getElementById("location").value;
        var response = await queryHotel(location, checkIn, checkOut, guests, document.getElementById("rooms").value, stars, document.getElementById("radius").value, "MILES", "USD", 0, getBudget());
        console.log(response);

        var displayStr = "";
        var i = 0;

        if(response.data.length == 0){
            document.getElementById("matches").innerHTML = "No matches found.";
            return;
        }

        for(var hotel of response.data) {
            if(hotel.offers.length == 0)
                continue;

            var hName = hotel.hotel.name;
            
            var offer = hotel.offers[0];
            
            var price = offer.price.base;
            if(offer.price.total)
                price = offer.price.total;

            var rating = parseInt(hotel.hotel.rating);
            var ratingStr = "";
            for(var i = 0; i < 5; i++){
                ratingStr += (i < rating ? "★" : "☆");
            }
            
            displayStr += "<p>" + `<h3>${hName}</h3>${ratingStr}<br><br><b>Price: $${price}</b>`;
            displayStr += `<br>${hotel.hotel.hotelDistance.distance} ${hotel.hotel.hotelDistance.distanceUnit} from location`;
            if(hotel.hotel.description)
                displayStr += `<br><br>${hotel.hotel.description.text}`;
            displayStr += `<br><br>Room type: ${offer.room.typeEstimated.category}, beds: ${offer.room.typeEstimated.beds}, ${offer.room.typeEstimated.bedType}. Description: ${offer.room.description.text}.<br>`;

            var amenities = "";
            for(var a of hotel.hotel.amenities){
                amenities += (amenities.length == 0 ? "" : ", ") + a.replace(/_/g, ' ').toLowerCase();
            }

            displayStr += `<br>Amenities: ${amenities}.</p><br>`

            i++;
        }

        document.getElementById("matches").innerHTML = displayStr;
    })()
}

function flightSearch(){
    document.getElementById("matches").innerHTML = "Looking for matching flights...";
    (async () => {
        var stops = -1;
        var nonStop = document.getElementById("stops-one").checked;

        var includedAirlines = null;
        if(!document.getElementById("Any-Airline").checked){
            includedAirlines = [];
            for(var s of ["JetBlue", "Delta", "Southwest", "United"]){
                if(document.getElementById(s).checked)
                    includedAirlines.push(document.getElementById(s).value);
            }
        }

        if(nonStop){
            stops = 1;
        }
        if(document.getElementById("stops-two").checked)
            stops = 2;
        if(document.getElementById("stops-three").checked)
            stops = 3;

        var departureDate = document.getElementById("from").value;
        var returnDate = document.getElementById("to").value;
        if(returnDate.length == 0)
            returnDate = null;

        var departure = document.getElementById("initial").value;
        var arrival = document.getElementById("destination").value;
        var response = await queryFlight(departure, arrival, departureDate, returnDate, 1, nonStop, includedAirlines, "USD", getBudget(), 20);
        console.log(response);

        var displayStr = "";

        for(var flight of response.data) {
            var itinStr = "";

            var i = 1;
            for(var itinerary of flight.itineraries){
                var segStr = "";
                for(var segment of itinerary.segments){
                    if(!segStr){
                        segStr = segment.departure.iataCode;
                    }
                    segStr += ` --${segment.carrierCode}--> ${segment.arrival.iataCode}`;
                }
                var name = `Itinerary ${i}`;
                if(i == 1)
                    name = "Outgoing trip";
                if(i == 2)
                    name = "Return trip";
                itinStr += `<br>&nbsp;&nbsp;&nbsp;&nbsp;${name}: segments ${itinerary.segments.length}: ${segStr}`;
                i++;
            }

            if(stops >= 0){
                if(!(stops == numSeg || (stops == 3 && numSeg >= stops)))
                    continue;
            }

            displayStr += `<h3>Option ${flight.id}<span style='font-size:16px;font-weight:normal'>${itinStr}</span></h3><p>` +
            `Price: ${flight.price.total}, bookable seats: ${flight.numberOfBookableSeats}, ${flight.oneWay ? 'one way' : 'roundtrip'}` + 
             "</p>";
        }

        document.getElementById("matches").innerHTML = displayStr;
    })()
}

function wiki_search(){
    
}


$(function(){
    $("#to").datepicker({ dateFormat: 'yy-mm-dd' });
    $("#from").datepicker({ dateFormat: 'yy-mm-dd' }).bind("change",function(){
        var minValue = $(this).val();
        minValue = $.datepicker.parseDate("yy-mm-dd", minValue);
        if(!minValue)
            return;
        minValue.setDate(minValue.getDate()+1);
        $("#to").datepicker( "option", "minDate", minValue );
    })
});
