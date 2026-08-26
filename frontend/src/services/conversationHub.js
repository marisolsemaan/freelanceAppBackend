import {HubConnectionBuilder, LogLevel,} from "@microsoft/signalr";

import { getToken } from "../utils/jwtStorage";

let connection = null;

export const startConversationHub = async (
  onConversationUpdated
) => {
  if (connection) {
    return connection;
  }

  connection = new HubConnectionBuilder()
    .withUrl(
      "http://localhost:5043/conversationHub",
      {
        accessTokenFactory: () => getToken() || "",
      }
    )
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  connection.on(
    "ConversationUpdated",
    onConversationUpdated
  );

  await connection.start();

  return connection;
};

export const stopConversationHub = async () => {
  if (!connection) return;

  await connection.stop();

  connection = null;
};