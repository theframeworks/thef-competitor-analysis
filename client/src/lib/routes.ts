export type AppRoute =
  | { name: "library" }
  | { name: "setup" }
  | { name: "session" }
  | { name: "research"; id: string };

export function parsePath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/setup") return { name: "setup" };
  if (path === "/research/session") return { name: "session" };

  const researchMatch = path.match(/^\/research\/([^/]+)$/);
  if (researchMatch) return { name: "research", id: researchMatch[1] };

  return { name: "library" };
}

export function pathForRoute(route: AppRoute): string {
  switch (route.name) {
    case "library":
      return "/";
    case "setup":
      return "/setup";
    case "session":
      return "/research/session";
    case "research":
      return `/research/${route.id}`;
  }
}

export function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
}

export function replacePath(path: string) {
  if (window.location.pathname !== path) {
    window.history.replaceState(null, "", path);
  }
}
