import { Link } from "react-router"

import logo from '@/assets/logo.svg';
import UserButton from "@/features/auth/ui/UserButton";

const Header = () => {
  return (
    <div className="flex items-center justify-between">
        <div className="mb-8 flex items-center gap-3">
            <Link to='/' className="rounded-lg">
                <img src={logo} alt="logo" className="size-10 text-black" />
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Artist Profile</h1>
                <p className="text-zinc-400 mt-1">Manage your music catalog</p>
            </div>
        </div>
        <UserButton />
    </div>
  )
}

export default Header