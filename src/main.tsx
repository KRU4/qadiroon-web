import { createRoot } from "react-dom/client";
import { AppRouter } from "./Router.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
