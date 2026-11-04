import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/contato', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
