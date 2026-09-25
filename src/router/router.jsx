import {
  createHashRouter,
  Navigate,
} from "react-router-dom";

import App from "../App";

import Login from "../page/Login/Login";
import Register from "../page/Register/Register";
import Profile from "../page/Profile/Profile";
import Room from "../page/Room/Room";
import ProtectedRoute from "./ProtectedRoute";
import Game from "../page/Game/Game";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,

    children: [
      {
        index: true,
        element: (
          <Navigate
            to="/login"
            replace
          />
        ),
      },

      {
        path: "/login",
        element: <Login />,
      },

      {
        path: "/register",
        element: <Register />,
      },

      {
        element: <ProtectedRoute />,

        children: [
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "room/:id",
            element: <Room />,
          },
          {
            path: 'game/:id',
            element: <Game />
          }
        ],
      },
    ],
  },
]);

export default router;