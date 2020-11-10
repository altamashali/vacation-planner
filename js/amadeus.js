var amadeusID = "ZHFzGm9A3T7f9hUZHH65IiEVugfaGZiy";
var amadeusSecret = "CUOFRuZFAjXjEuu9";

var amadeusToken = null;
var tokenExpirationTime = null;

function encodeBody(params){
    var body = [];
    for (var property in params) {
        body.push(encodeURIComponent(property) + "=" + encodeURIComponent(params[property]));
    }
    return body.join("&");
}

async function regenerateToken(){

    var body = encodeBody({
        'grant_type': 'client_credentials',
        'client_id': amadeusID,
        'client_secret': amadeusSecret
    });

    var data = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => response.json());

    amadeusToken = data.access_token;
    tokenExpirationTime = Date.now() + 1000 * data.expires_in;
    return amadeusToken;

}

async function getToken(){
    if(!amadeusToken || (Date.now() >= tokenExpirationTime)){
        await regenerateToken();
    }
    return amadeusToken;
}

async function queryFlight(originLocationCode, destinationLocationCode, departureDate, returnDate, adults, nonStop, includedAirlines, currencyCode, maxPrice, maxOffers){
    
    var token = await getToken();

    var body = encodeBody({
        'grant_type': 'client_credentials',
        'client_id': amadeusID,
        'client_secret': amadeusSecret
    });

    var url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDate=${departureDate}&adults=${adults}&nonStop=${nonStop}&currencyCode=${currencyCode}`;
    if(maxPrice){
        url += "&maxPrice=" + maxPrice;
    }
    if(maxOffers){
        url += "&max=" + maxOffers;
    }
    if(returnDate)
        url += "&returnDate=" + returnDate;
    if(includedAirlines){
        url += "&includedAirlineCodes=" + includedAirlines.join(',');
    }

    return fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json());

}

async function queryHotel(locationCode, checkInDate, checkOutDate, guests, rooms, stars, radius, radiusUnits, currencyCode, minPrice, maxPrice){
    
    var token = await getToken();

    var body = encodeBody({
        'grant_type': 'client_credentials',
        'client_id': amadeusID,
        'client_secret': amadeusSecret
    });

    var url = `https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${locationCode}&checkInDate=${checkInDate}&adults=${guests}&roomQuantity=${rooms}&radius=${radius}&radiusUnit=${radiusUnits}&ratings=${stars.join(',')}&priceRange=${minPrice}-${maxPrice}&currency=${currencyCode}&paymentPolicy=NONE&includeClosed=false&bestRateOnly=true&view=FULL&sort=PRICE`;

    if(checkOutDate)
        url += "&checkOutDate=" + checkOutDate;

    return fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json());

}