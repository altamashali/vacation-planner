var triposoID = "MJR0K8KB";
var triposoToken = "ci9voa3pata2em8wxjb0ie0jubz82bg4";

async function queryPOI(locationId, tagLabels, count, orderBy, fields){
    
    var token = await getToken();

    var url = `https://triposo.com/api/20200803/poi.json?location_id=${locationId}&count=${count}&order_by=${orderBy}&fields=${fields.join(',')}`;
    for(var tag of tagLabels){
        url += "&tag_labels=" + tag;
    }

    url = "https://cors-anywhere.herokuapp.com/" + url; // CORS proxy

    return fetch(url, {
        headers: {
            'X-Triposo-Account': triposoID,
            'X-Triposo-Token': triposoToken,
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "*"
        }
    })
    .then(response => response.json());

}