import { gql } from "@apollo/client/core";

export const REQUEST_TRACK_UPLOAD = gql`
  mutation RequestTrackUpload($input: TrackUploadRequestInput!) {
    requestTrackUpload(input: $input) {
      fileKey
      uploadUrl
      coverKey
      coverUploadUrl
      expiresInSeconds
    }
  }
`;

export const CREATE_TRACK = gql`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
      id
      title
      artist
      duration
      coverUrl
    }
  }
`;

export const TOGGLE_LIKE = gql`
  mutation ToggleLike($trackId: ID!) {
    toggleLike(trackId: $trackId)
  }
`;

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      accessToken
      refreshToken
      expiresInSeconds
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const REFRESH_TOKENS = gql`
  mutation RefreshTokens($refreshToken: String!) {
    refreshTokens(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      expiresInSeconds
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;
