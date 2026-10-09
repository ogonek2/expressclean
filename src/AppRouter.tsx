import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom"
import App from "./App"
import CategoryPage from "./CategoryPage"
import { Footer, Header } from "./components/Layout"
import BusinessPage from "./pages/BusinessPage"
import ConsultPage from "./pages/ConsultPage"
import FaqPage from "./pages/FaqPage"
import ProcessPage from "./pages/ProcessPage"
import ServicesPage from "./ServicesPage"

function RootLayout() {
  return (
    <div className="page-frame">
      <a className="skip-link" href="#top">
        До основного вмісту
      </a>
      <Header />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "poslugi", element: <ServicesPage /> },
      { path: "poslugi/:slug", element: <CategoryPage /> },
      { path: "dlya-biznesu", element: <BusinessPage /> },
      { path: "yak-pratsyuyemo", element: <ProcessPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "konsultatsiya", element: <ConsultPage /> },
      { path: "poslugi.html", element: <Navigate to="/poslugi" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
