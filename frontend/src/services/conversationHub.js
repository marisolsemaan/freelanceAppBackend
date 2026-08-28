import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import { getToken } from "../utils/jwtStorage";

let connection = null;
let startPromise = null;

export const startConversationHub = async (
  onConversationUpdated
) => {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(
        "http://localhost:5043/conversationHub",
        {
          accessTokenFactory: () =>
            getToken() || "",
        }
      )
      .withAutomaticReconnect()
      .configureLogging(
        LogLevel.Information
      )
      .build();
  }

  // Replace the previous handler.
  connection.off("ConversationUpdated");

  connection.on(
    "ConversationUpdated",
    onConversationUpdated
  );

  // Already connected.
  if (
    connection.state ===
    HubConnectionState.Connected
  ) {
    return connection;
  }

  // A connection is already being started.
  if (startPromise) {
    await startPromise;
    return connection;
  }

  if (
    connection.state ===
    HubConnectionState.Disconnected
  ) {
    startPromise = connection
      .start()
      .then(() => {
        console.log(
          "SignalR connected successfully"
        );
      })
      .catch((error) => {
        console.error(
          "SignalR connection failed:",
          error
        );

        throw error;
      })
      .finally(() => {
        startPromise = null;
      });

    await startPromise;
  }

  return connection;
};

export const stopConversationHub = async () => {
  if (!connection) return;

  // Do not interrupt an active negotiation.
  if (startPromise) {
    try {
      await startPromise;
    } catch {
      // Connection already failed.
    }
  }

  if (
    connection.state !==
    HubConnectionState.Disconnected
  ) {
    await connection.stop();
  }

  connection = null;
};