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
      {!isAuth && (
        <Button
          onClick={() => navigate("/login")}
          className="bg-white hover:bg-zinc-200 text-black rounded-full font-bold px-6"
        >
          Войти
        </Button>
      )}
    </>
  );
};

export default UserInfo;
