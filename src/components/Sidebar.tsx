'use client';

import {
  BarChart3,
  Briefcase,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Map,
  Share2,
  MessageSquare,
  FileText,
  BookOpen,
  FolderTree,
  Quote,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },

    {
      id: 'languages',
      label: 'Languages & Dictionary',
      icon: Briefcase,
      children: [
        { id: 'language-list', label: 'Languages', path: '/languages' },
        { id: 'dictionaries', label: 'Dictionary', path: '/dictionaries' },
        { id: 'translations', label: 'Translations', path: '/translations' },
      ],
    },

    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      children: [
        { id: 'phones', label: 'Phones', path: '/phones' },
        { id: 'emails', label: 'Emails', path: '/emails' },
        { id: 'maps', label: 'Maps', path: '/maps' },
        { id: 'addresses', label: 'Addresses', path: '/addresses' },
        { id: 'social-networks', label: 'Social Networks', path: '/social-networks' },
        { id: 'contact-messages', label: 'Contact Messages', path: '/contact-messages' },
      ],
    },

    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      children: [
        { id: 'about', label: 'About', path: '/about' },
        { id: 'services', label: 'Services', path: '/services' },
        { id: 'portfolios', label: 'Portfolios', path: '/portfolios' },
        { id: 'testimonials', label: 'Testimonials', path: '/testimonials' },
        { id: 'pages', label: 'Pages', path: '/pages' },
        { id: 'faqs', label: 'FAQs', path: '/faqs' },
        { id: 'statistics', label: 'Statistics', path: '/statistics' },
      ],
    },

    {
      id: 'blogs',
      label: 'Blogs',
      icon: BookOpen,
      children: [
        { id: 'blog-categories', label: 'Blog Categories', path: '/blog-categories' },
        { id: 'blogs', label: 'Blogs', path: '/blogs' },
        { id: 'tags', label: 'Tags', path: '/tags' },
      ],
    },

    { id: 'projects', label: 'Projects', icon: Briefcase, path: '/projects' },
    { id: 'team', label: 'Team Members', icon: Users, path: '/team' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleMenuClick = (item: any) => {
    if (item.children) {
      setOpenMenu(openMenu === item.id ? null : item.id);
      return;
    }

    setActiveItem(item.id);
    navigate(item.path);
  };

  const handleSubClick = (sub: any) => {
    setActiveItem(sub.id);
    navigate(sub.path);
  };

  useEffect(() => {
    const currentPath = location.pathname;

    menuItems.forEach((item: any) => {
      if (item.children) {
        const sub = item.children.find((c: any) => c.path === currentPath);

        if (sub) {
          setActiveItem(sub.id);
          setOpenMenu(item.id);
        }
      } else if (item.path === currentPath) {
        setActiveItem(item.id);
      }
    });
  }, [location.pathname]);

  return (
    <aside
      style={{
        width: isOpen ? '260px' : '0px',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        transition: 'all .3s',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--accent)',
            margin: 0,
          }}
        >
          Agency
        </h1>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            marginTop: '4px',
          }}
        >
          Admin Panel
        </p>
      </div>

      {/* MENU */}
      <nav
        style={{
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {menuItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isOpenMenu = openMenu === item.id;

          return (
            <div key={item.id}>
              {/* PARENT ITEM */}
              <button
                onClick={() => handleMenuClick(item)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive
                    ? 'var(--primary-foreground)'
                    : 'var(--foreground)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: '.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>

                {item.children &&
                  (isOpenMenu ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </button>

              {/* SUBMENU */}
              {item.children && isOpenMenu && (
                <div
                  style={{
                    marginTop: '6px',
                    paddingLeft: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {item.children.map((sub: any) => {
                    const isSubActive = activeItem === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubClick(sub)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          background: isSubActive
                            ? 'var(--secondary)'
                            : 'transparent',
                          color: isSubActive
                            ? 'var(--accent)'
                            : 'var(--muted-foreground)',
                          transition: '.2s',
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}