import { useNavigate } from "react-router";

import { useAuth } from "@/features/auth/lib/useAuth";

import ListenerPage from "./listener/ListenerPage";
import ArtistPage from "./artist/ArtistPage";

const ProfilePage = () => {
  const { isAuth, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuth) {
    navigate("/login");
  }

  if (user?.role === "artist") {
    return <ArtistPage />;
  }

  return <ListenerPage />;
};

export default ProfilePage;
