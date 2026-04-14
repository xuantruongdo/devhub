export interface IncomingCallPayload {
  from: number;
  offer: SignalData;
  conversationId: number;
  callerName: string;
  callerAvatar: string | null;
}

export interface CallAnsweredPayload {
  answer: SignalData;
}

export interface IceCandidatePayload {
  candidate: SignalData;
}
