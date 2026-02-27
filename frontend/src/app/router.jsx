import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = lazy(() => import('../pages/HomePage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

function RootLayout() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Outlet />
        </Box>
      </Container>
      <Footer />
    </>
  );
}

function Loading() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>Loading…</Box>
    </Container>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Suspense fallback={<Loading />}><HomePage /></Suspense> },
      { path: '/admin', element: <Suspense fallback={<Loading />}><AdminPage /></Suspense> }
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
