import { HubConnectionBuilder } from "@microsoft/signalr";

export function createNotificationConnection(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const notifyUrl = baseUrl + "/notify"; 

  return new HubConnectionBuilder()
    .withUrl(notifyUrl, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();
}
