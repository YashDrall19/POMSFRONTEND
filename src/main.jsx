import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Profiles/Superadmin/Layout.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
const Dashboard = lazy(() => import('./Profiles/Superadmin/master/Dashboard.jsx'));
import Company from  "./Profiles/Superadmin/master/Company.jsx";
import Addresses from  "./Profiles/Superadmin/master/Addresses.jsx";
import Currency from  "./Profiles/Superadmin/master/Currency.jsx";
import Products from  "./Profiles/Superadmin/master/Products.jsx";
import Remarks from  "./Profiles/Superadmin/master/Remarks.jsx";
import Ship from  "./Profiles/Superadmin/master/Ship.jsx";
import Terms from  "./Profiles/Superadmin/master/Terms.jsx";
import User from  "./Profiles/Superadmin/master/User.jsx";
import Vendor from  "./Profiles/Superadmin/master/Vendor.jsx";
import Generate from  "./Profiles/Superadmin/transaction/Generate.jsx";
import Upload from  "./Profiles/Superadmin/transaction/Upload.jsx";
import { Provider } from 'react-redux'
import { store } from './redux/store.jsx'
import { ToastContainer } from 'react-toastify'
import Login from './Auth/Login.jsx'
import POStatus from './Profiles/Superadmin/transaction/POStatus.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import MRStatus from './Profiles/Superadmin/transaction/MRStatus.jsx'
import Reports from './Profiles/Superadmin/Reports.jsx'
import InvoiceReports from './Profiles/Superadmin/InvoiceReports.jsx'
// import "./index.scss";

const routes = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {path: "", element: <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}><div className="spinner-border text-warning"/></div>}><Dashboard /></Suspense>},
      {path: "company", element: <Company />},
      {path: "addresses", element: <Addresses />},
      {path: "vendor", element: <Vendor />},
      {path: "terms", element: <Terms />},
      {path: "currency", element: <Currency />},
      {path: "products", element: <Products />},
      {path: "remarks", element: <Remarks />},
      {path: "ship-via", element: <Ship />},
      {path: "currency", element: <Currency />},
      {path: "products", element: <Products />},
      {path: "remarks", element: <Remarks />},
      {path: "user", element: <User />},
      {path: "generate-piv", element: <Generate />},
      {path: "piv-status", element: <POStatus />},
      {path: "mr-status", element: <MRStatus />},
      {path: "reports", element: <Reports />},
      {path: "invoice-reports", element: <InvoiceReports />},
      {path: "upload", element: <Upload />},
      {path: "*", element: <h1>Page not found</h1>},
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <div>
      <Provider store={store}>
        <AuthProvider>
          <RouterProvider router={routes} />
        </AuthProvider>
      </Provider>
      <ToastContainer />
    </div>
  // </StrictMode>
)
