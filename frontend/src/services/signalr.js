import { HubConnectionBuilder } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl('https://localhost:5001/turnhub') // This should be your backend URL
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
