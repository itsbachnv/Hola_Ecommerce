import { HubConnectionBuilder } from "@microsoft/signalr";

export const createChatConnection = (token?: string, guestId?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Tạo URL có query phù hợp
  let url = `${baseUrl}/chat`;
  const query: string[] = [];

  if (guestId) query.push(`guestId=${guestId}`);
  if (token) query.push(`access_token=${token}`);

  if (query.length > 0) {
    url += "?" + query.join("&");
  }

  const connectionBuilder = new HubConnectionBuilder().withUrl(url);

  return connectionBuilder.build();
};

// Guest connection (không có token)
export const createGuestChatConnection = (guestId: string) => {
  return createChatConnection(undefined, guestId);
};

// User connection (có token)
export const createUserChatConnection = (token: string) => {
  return createChatConnection(token);
};
