import { useNavigate } from "react-router";

import { useAuth } from "@/features/auth/lib/useAuth";

import ListenerProfilePage from "./Listener/ListenerProfilePage";
import ArtistProfilePage from "./Artist/ArtistProfilePage";

const ProfilePage = () => {
  const { isAuth, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuth) {
    navigate("/login");
  }

  if (user?.role === "artist") {
    return <ArtistProfilePage />;
  }

  return <ListenerProfilePage />;
};

export default ProfilePage;
