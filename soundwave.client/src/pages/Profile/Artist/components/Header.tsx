import { Link } from "react-router";

import logo from "@/assets/logo.svg";
import UserButton from "@/features/auth/ui/UserButton";
import { Typography } from "@/shared/ui/Typography";

const Header = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Link to="/" className="rounded-lg transition-opacity hover:opacity-80">
        <img src={logo} alt="logo" className="size-10" />
      </Link>
      <div>
        <Typography
          as="h1"
          variant="title"
          size="lg"
          className="text-2xl font-bold"
        >
          Профиль артиста
        </Typography>
        <Typography variant="subtitle" size="sm" className="mt-0.5">
          Управляйте своим музыкальным каталогом
        </Typography>
      </div>
    </div>
    <UserButton />
  </div>
);

export default Header;
