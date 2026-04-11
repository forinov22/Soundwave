import { Routes } from "react-router";

import { routes } from "./router/routes";
import { renderRoute } from "./router/renderRoute";
import { useAuthBootstrap } from "./features/auth/lib/useAuthBootstrap";

function App() {
  useAuthBootstrap()

  return (
    <Routes>
      {routes.map(renderRoute)}
    </Routes>
  );
}

export default App;
