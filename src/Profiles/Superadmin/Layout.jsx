import { useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FaBars,
  FaBuilding,
  FaFileUpload,
  FaMoneyBillWave,
  FaShippingFast,
  FaUserFriends,
  FaUsers,
  FaClipboardList,
  FaFileInvoice,
  FaChevronDown,
  FaFileAlt,
  FaChartLine,
  FaMoneyCheckAlt,
} from 'react-icons/fa'
import { IoLogOut } from 'react-icons/io5'
import {
  MdDashboard,
  MdLocationOn,
  MdInventory,
  MdDescription,
  MdAssessment,
  MdCurrencyRupee,
} from 'react-icons/md'
import Modal from '../../components/Modal'
import logo from "../../../public/logo.png";
import { AuthContext } from '../../context/AuthContext.jsx'

export default function Layout({ basePath = '' }) {
  const [showSidebar, setShowSidebar] = useState(true)
  const location = useLocation();
  const navigate = useNavigate();

  const content = [
    {
      id: 'dashboard',
      route: '',
      label: 'Dashboard',
      icon: <MdDashboard />,
    },
    {
      id: 'master',
      label: 'Master',
      icon: <FaClipboardList />,
      children: [
        {
          id: 'company',
          route: 'company',
          label: 'Company',
          icon: <FaBuilding />,
        },
        {
          id: 'addresses',
          route: 'addresses',
          label: 'Addresses',
          icon: <MdLocationOn />,
        },
        {
          id: 'vendor',
          route: 'vendor',
          label: 'Vendor',
          icon: <FaUsers />,
        },
        {
          id: 'terms',
          route: 'terms',
          label: 'Terms',
          icon: <MdDescription />,
        },
        {
          id: 'ship_via',
          route: 'ship-via',
          label: 'Ship Via',
          icon: <FaShippingFast />,
        },
        {
          id: 'currency',
          route: 'currency',
          label: 'Currency',
          icon: <MdCurrencyRupee />,
        },
        {
          id: 'product',
          route: 'products',
          label: 'Products',
          icon: <MdInventory />,
        },
        {
          id: 'remarks',
          route: 'remarks',
          label: 'Remarks',
          icon: <MdDescription />,
        },
        {
          id: 'user',
          route: 'user',
          label: 'Users',
          icon: <FaUserFriends />,
        },
      ],
    },
    {
      id: 'transaction',
      label: 'Transaction',
      icon: <FaFileInvoice />,
      children: [
        {
          id: 'upload',
          route: 'upload',
          label: 'Upload Product (.CSV)',
          icon: <FaFileUpload />,
        },
        {
          id: 'generate_po',
          route: 'generate-piv',
          label: 'Generate Quotation',
          icon: <FaClipboardList />,
        },
        {
          id: 'po_status',
          route: 'piv-status',
          label: 'Update Quotation Status',
          icon: <MdAssessment />,
        },
        // {
        //   id: 'mr_status',
        //   route: 'mr-status',
        //   label: 'Update MR Status',
        //   icon: <MdAssessment />,
        // },
      ],
    },
    {...(true) && {
      id: 'reports',
      route: 'reports',
      label: 'Quotation Reports',
      icon: <FaChartLine />,
    }},
    {
      id: 'invoice-reports',
      route: 'invoice-reports',
      label: 'Invoice Reports',
      icon: <FaMoneyCheckAlt />,
    }
  ]

  const buildPath = (route) => {
    if (route === '') {
      return basePath || '/'
    }
    return `${basePath}/${route}`.replace(/\/\/+/, '/')
  }

  const activeLabel = useMemo(() => {
    const relativePath = location.pathname.replace(basePath, '').replace(/^\//, '')
    if (relativePath === '') return 'Dashboard'
    const direct = content.find((item) => item.route === relativePath)
    if (direct) return direct.label
    const child = content.flatMap((item) => item.children || []).find((entry) => entry.route === relativePath)
    return child?.label || 'Dashboard'
  }, [location.pathname, basePath, content])

  const getInitialMenu = () => {
    const relativePath = location.pathname
      .replace(basePath, '')
      .replace(/^\//, '')

    const matchedParent = content.find((item) =>
      item.children?.some((child) => child.route === relativePath)
    )

    return matchedParent?.id || null
  }
  const [openMenu, setOpenMenu] = useState(getInitialMenu);

  const { user, loading, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);


  const [showLogout, setShowLogout] = useState(false);

  // Show spinner while auth resolves; while unauthenticated the effect above redirects to /login.
  if (loading || !user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', background: '#f7f7f7' }}
      >
        <div className="spinner-border text-warning" role="status" aria-label="Loading" />
      </div>
    );
  }

  

  return (
    <div className="vh-100 overflow-hidden bg-light">
      <div className="d-flex h-100">
        <aside
          className="bg-dark text-white d-flex flex-column"
          style={{
            width: showSidebar ? '260px' : '0px',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          }}
        >
          <div className="border-bottom d-flex align-items-center p-0" style={{ maxHeight: '140px' }}>
            <img src={logo} alt="" className='w-100 h-100' style={{scale: 1.3}} />
          </div>

          <div className="flex-grow-1 overflow-auto py-2">
            {content.map((item) => {
              const isOpen = openMenu === item.id;
              return (
                <div key={item.id}>
                  {item.children ? (
                    <button
                      className="btn btn-dark text-white w-100 rounded-0 border-0 d-flex justify-content-between align-items-center px-3 py-2"
                      onClick={() => setOpenMenu((prev) => (prev === item.id ? null : item.id))}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <span style={{ transition: '0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <FaChevronDown size={12} />
                      </span>
                    </button>
                  ) : (
                    <NavLink
                      to={buildPath(item.route)}
                      end
                      className={({ isActive }) =>
                        `btn w-100 rounded-0 border-0 d-flex align-items-center gap-2 px-3 py-2 text-start ${
                          isActive ? 'btn-warning text-dark' : 'btn-dark text-white'
                        }`
                      }
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  )}

                  {item.children && (
                    <div style={{ maxHeight: isOpen ? `${item.children.length * 52}px` : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                      <div className="bg-black">
                        {item.children.map((child) => {
                          if (
                            user?.role !== "ADMIN" &&
                            ["users", "po_status"].includes(child?.id)
                          ) {
                            return;
                          }
                          return (
                            <NavLink
                              key={child.id}
                              to={buildPath(child.route)}
                              end
                              className={({ isActive }) =>
                                `btn w-100 rounded-0 border-0 d-flex align-items-center gap-2 ps-5 py-2 text-start ${
                                  isActive ? 'btn-warning text-dark' : 'btn-dark text-white'
                                }`
                              }
                            >
                              <span>{child.icon}</span>
                              <span>{child.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
          <header className="bg-light border-bottom shadow d-flex justify-content-between align-items-center px-3" style={{ height: '60px', minHeight: '60px' }}>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-dark" onClick={() => setShowSidebar(!showSidebar)}>
                <FaBars />
              </button>
              <div>
                <h5 className="m-0 fw-bold text-capitalize">{activeLabel}</h5>
                {user && (
                  <small className="text-muted">
                    {user?.name || user?.employee_code || user?.username} · {user?.role}
                  </small>
                )}
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => {
                setShowLogout(true);
              }}
            >
              <IoLogOut size={20} />
            </button>
          </header>

          <main className="flex-grow-1 overflow-auto pt-5 px-4">
            <Outlet />
          </main>
        </div>
      </div>


      <Modal 
        showModal={showLogout}
        onclose={() => setShowLogout(false)}
        title="Logout"
        size='md'
        content={
          <div>
            <div className="modal-content p-4">
              Are you sure you want to logout?
            </div>
            <div className="modal-footer">
              <button 
                className='btn btn-primary'
                onClick={() => {
                  logout();
                  navigate("/login", {replace: true});
                }}
              >
                Logout
              </button>
            </div>
          </div>
        }
      />
    </div>
  )
}
