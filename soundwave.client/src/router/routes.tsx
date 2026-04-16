import type { ReactNode } from "react";
import { Navigate } from "react-router";

import AuthCallbackPage from "@/pages/Auth/AuthCallbackPage";
import AlbumDetailsPage from "@/pages/Home/components/PageLayout/AlbumDetailsPage";
import ArtistDetailsPage from "@/pages/Home/components/PageLayout/ArtistDetailsPage";
import ArtistDiscographyPage from "@/pages/Home/components/PageLayout/ArtistDiscographyPage";
import HomePage from "@/pages/Home/components/PageLayout/HomePage";
import MainLayout from "@/pages/Home/MainLayout";
import LoginPage from "@/pages/Auth/LoginPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import SearchPage from "@/pages/Search/SearchPage";

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
        path: "artist/:id",
        element: <ArtistDetailsPage />,
      },
      {
        path: "artist/:id/discography",
        element: <ArtistDiscographyPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <ProfilePage />,
    protected: true,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
