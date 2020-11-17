async function queryIntro(pageTitle){
    
    var url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=1&explaintext=1&titles=${pageTitle}`;
    
    url = "https://cors-anywhere.herokuapp.com/" + url; // CORS proxy
    
    return fetch(url)
    .then(response => response.json());

}