function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    console.log("Latitude:", latitude);
                    console.log("Longitude:", longitude);
                    resolve({ location: { latitude, longitude } });
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            const err = new Error("Geolocation is not supported by this browser.");
            console.error(err.message);
            reject(err);
        }
    });
}

export default getCurrentLocation;