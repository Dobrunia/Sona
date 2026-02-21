import {
  RequestTrackUploadDocument,
  CreateTrackDocument,
  DeleteTrackDocument,
  ToggleLikeDocument,
  LoginWithGoogleDocument,
  RefreshTokensDocument,
  LogoutDocument
} from "@/graphql/generated";

export const REQUEST_TRACK_UPLOAD = RequestTrackUploadDocument;
export const CREATE_TRACK = CreateTrackDocument;
export const DELETE_TRACK = DeleteTrackDocument;
export const TOGGLE_LIKE = ToggleLikeDocument;
export const LOGIN_WITH_GOOGLE = LoginWithGoogleDocument;
export const REFRESH_TOKENS = RefreshTokensDocument;
export const LOGOUT = LogoutDocument;
