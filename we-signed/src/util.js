import {set, get} from 'idb-keyval';

export default async function getOrCreateDeviceId(){
    let deviceId = await get("deviceId");

    if(!deviceId){
        deviceId = crypto.randomUUID();
        await set('deviceId', deviceId);
        console.log("new deviced", deviceId);
    }else{
        console.log('Exising deviceId found', deviceId);
    }

    return deviceId;
}