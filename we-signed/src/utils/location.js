function getCurrentLocation() {
    let latitude;
    let longitude;
    if ("geolocation" in navigator) {

        navigator.geolocation.getCurrentPosition(
            (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            // You can now send this to your backend
            // via fetch, axios, etc.
            },
            (error) => {
                console.error("Error getting location:", error.message);
                return;
            },
            {
            enableHighAccuracy: true, // use GPS if available
            timeout: 10000,           // 10 seconds timeout
            maximumAge: 0             // don't use cached location
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        return;
    }  
   
    return { latitude, longitude };
}

export default getCurrentLocation;