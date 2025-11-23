import { HubConnectionBuilder } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5124/turnhub')
    .build();

export const startConnection = async () => {
    try {
        await connection.start();
        console.log('SignalR Connected.');
    } catch (error) {
        console.log('SignalR Connection Error: ', error);
    }
};

export default connection;