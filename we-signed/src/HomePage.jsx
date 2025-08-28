import ComponentOffline from "./ComponentOffline";
import ComponentOnline from "./ComponentOnline";

export default function HomePage() {
    const isOnline = navigator.onLine;

    return (
        <>
            {isOnline ? <ComponentOnline /> : <ComponentOffline />};
        </>
        
    ) 
}

        