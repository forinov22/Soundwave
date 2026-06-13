import type { ReactNode } from "react";
import { Navigate } from "react-router";

import AuthCallbackPage from "@/pages/Auth/AuthCallbackPage";
import AlbumDetailsPage from "@/pages/Home/Album/AlbumDetailsPage";
import PlaylistDetailsPage from "@/pages/Home/Playlist/PlaylistDetailsPage";
import ArtistDetailsPage from "@/pages/Home/Artist/ArtistDetailsPage";
import ArtistDiscographyPage from "@/pages/Home/Artist/ArtistDiscographyPage";
import HomePage from "@/pages/Home/HomePage";
import TracksPage from "@/pages/Home/TracksPage";
import AlbumsPage from "@/pages/Home/AlbumsPage";
import ArtistsPage from "@/pages/Home/ArtistsPage";
import PlaylistsPage from "@/pages/Home/PlaylistsPage";
import HistoryPage from "@/pages/Home/HistoryPage";
import RecommendationsPage from "@/pages/Home/RecommendationsPage";
import MainLayout from "@/pages/Home/MainLayout";
import LoginPage from "@/pages/Auth/LoginPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import SearchPage from "@/pages/Search/SearchPage";
import AdminPage from "@/pages/Admin/AdminPage";

export type AppRoute = {
  index?: true;
  path?: string;
  element: ReactNode;
  children?: AppRoute[];
  protected?: boolean;
  publicOnly?: boolean;
};

export const routes: AppRoute[] = [
  {
    path: "/register",
    element: <RegisterPage />,
    publicOnly: true,
  },
  {
    path: "/login",
    element: <LoginPage />,
    publicOnly: true,
  },
  {
    path: "/auth-callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "album/:id",
        element: <AlbumDetailsPage />,
      },
      {
        path: "playlist/:id",
        element: <PlaylistDetailsPage />,
      },
      {
        path: "artist/:id",
        element: <ArtistDetailsPage />,
      },
      {
        path: "artist/:id/discography",
        element: <ArtistDiscographyPage />,
      },
      {
        path: "tracks",
        element: <TracksPage />,
      },
      {
        path: "albums",
        element: <AlbumsPage />,
      },
      {
        path: "artists",
        element: <ArtistsPage />,
      },
      {
        path: "playlists",
        element: <PlaylistsPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "recommendations",
        element: <RecommendationsPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <ProfilePage />,
    protected: true,
  },
  {
    path: "/admin",
    element: <AdminPage />,
    protected: true,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
