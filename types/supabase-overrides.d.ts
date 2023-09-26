declare module "@supabase/supabase-js" {
  type RealtimePayload = {
    type:
      | `${REALTIME_LISTEN_TYPES.BROADCAST}`
      | `${REALTIME_LISTEN_TYPES.PRESENCE}`
      | `${REALTIME_LISTEN_TYPES.POSTGRES_CHANGES}`;
    event: string;
    [key: string]: any;
  };

  interface RealtimeChannel {
    on(
      event:
        | `${REALTIME_LISTEN_TYPES.BROADCAST}`
        | `${REALTIME_LISTEN_TYPES.PRESENCE}`
        | `${REALTIME_LISTEN_TYPES.POSTGRES_CHANGES}`,
      filter: {
        event: string;
      },
      callback: (payload: RealtimePayload) => void
    ): RealtimeChannel;
  }
}
