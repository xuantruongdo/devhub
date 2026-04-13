export interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
}

export interface OfferPayload {
  callerId: number;
  offer: RTCSessionDescriptionInit;
  conversationId: number;
  callerName: string;
}

export interface AnswerPayload {
  answer: RTCSessionDescriptionInit;
}
