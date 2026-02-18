import { gql } from "@apollo/client/core";

export const TRACKS_QUERY = gql`
  query Tracks($search: String, $page: Int, $pageSize: Int) {
    tracks(search: $search, page: $page, pageSize: $pageSize) {
      items {
        id
        title
        artist
        duration
        coverUrl
        likedByMe
      }
      pageInfo {
        page
        pageSize
        total
        hasNextPage
      }
    }
  }
`;

export const FAVORITES_QUERY = gql`
  query Favorites($page: Int, $pageSize: Int) {
    favorites(page: $page, pageSize: $pageSize) {
      items {
        id
        title
        artist
        duration
        coverUrl
        likedByMe
      }
      pageInfo {
        page
        pageSize
        total
        hasNextPage
      }
    }
  }
`;

export const STREAM_URL_QUERY = gql`
  query StreamUrl($trackId: ID!) {
    streamUrl(trackId: $trackId)
  }
`;
