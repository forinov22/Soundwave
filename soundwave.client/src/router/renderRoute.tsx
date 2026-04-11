import { Route } from "react-router";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import type { AppRoute } from "./routes";

export function renderRoute(route: AppRoute): React.ReactNode {
  const { index, path, element, children, protected: isProtected, publicOnly } = route;

  let wrappedElement = element;

  if (isProtected) {
    wrappedElement = <ProtectedRoute>{wrappedElement}</ProtectedRoute>;
  }

  if (publicOnly) {
    wrappedElement = <PublicOnlyRoute>{wrappedElement}</PublicOnlyRoute>;
  }

  if (index) {
    return <Route index key="index" element={wrappedElement} />
  }

  return (
    <Route key={path} path={path} element={wrappedElement}>
      {children?.map(renderRoute)}
    </Route>
  );
}
