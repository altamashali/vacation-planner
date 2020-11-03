function getBudget(){
    return parseInt(document.getElementById("myRange").value);
}

window.onload = function() {
    document.getElementById("myRange").addEventListener('input', function() {
        document.getElementById("budget").value = "$" + getBudget().toLocaleString();
    });

    document.getElementById("budget").addEventListener('input', function() {
        var str = document.getElementById("budget").value;
        if(str.length > 0){
            document.getElementById("myRange").value = parseInt(document.getElementById("budget").value.replace("$", "").replace(",", "")).toLocaleString();
        }
    });

    var d = new Date();
    var x = document.getElementById("from");
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var yy = d.getFullYear();
    dd = String(dd).padStart(2, '0');
    mm = String(mm).padStart(2, '0');
    x.value = yy + '-' + mm + '-' + dd;
};

function test(){
}

function flightSearch(){
    document.getElementById("matches").innerHTML = "Looking for matching flights...";
    (async () => {
        var stops = -1
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

            displayStr += "<p>" + `Option ${flight.id} --- Price: ${flight.price.total}, bookable seats: ${flight.numberOfBookableSeats}, one way: ${flight.oneWay} ${itinStr}` + "</p>";
        }

        document.getElementById("matches").innerHTML = displayStr;
    })()
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
