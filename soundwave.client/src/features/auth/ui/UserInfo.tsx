import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

import { useAuth } from "../lib/useAuth";
import UserButton from "./UserButton";

const UserInfo = () => {
  const navigate = useNavigate();
  const { isAuth } = useAuth();

  return (
    <>
      {isAuth && <UserButton />}
      {!isAuth && <Button onClick={() => navigate("/login")}>Login</Button>}
    </>
  );
};

export default UserInfo;
