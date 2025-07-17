import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import RootLayout from "./pages/RootLayout/index";
import Upcoming from "./pages/Upcoming/index";
import Today from "./pages/Today/index";
import Calendar from "./pages/Calendar/index";
import StickyWall from "./pages/StickyWall/index";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="/" element={<Navigate to={"/upcoming"} replace={true} />} />
      <Route path="upcoming" element={<Upcoming />} />
      <Route path="today" element={<Today />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="sticky-wall" element={<StickyWall />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Route>
  )
);

const Routing = () => <RouterProvider router={router} />; 

export default Routing;
