// ** Icons
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import Car from 'mdi-material-ui/Car'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import MapSearch from 'mdi-material-ui/MapSearch'
import Bell from 'mdi-material-ui/Bell'
import AccountCog from 'mdi-material-ui/AccountCog'
import ViewList from 'mdi-material-ui/ViewList'
import FormatListBulleted from 'mdi-material-ui/FormatListBulleted'
import FilePlus from 'mdi-material-ui/FilePlus'
import FolderOpen from 'mdi-material-ui/FolderOpen'
import FileDocument from 'mdi-material-ui/FileDocument'
import FileDocumentEdit from 'mdi-material-ui/FileDocumentEdit'
import MapMarkerRadius from 'mdi-material-ui/MapMarkerRadius'
import ClipboardList from 'mdi-material-ui/ClipboardList'
import ViewGridPlusOutline from 'mdi-material-ui/ViewGridPlusOutline'
import Table from 'mdi-material-ui/Table'
import MessageText from 'mdi-material-ui/MessageText'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import SettingsOutline from 'mdi-material-ui/CogOutline'
import Web from 'mdi-material-ui/Web'
import ShieldAccount from 'mdi-material-ui/ShieldAccount'
import Phone from 'mdi-material-ui/Phone'

import { useState } from 'react'
import { PhoneAndroid } from '@mui/icons-material'


const getUserPrivilege = () => {
  if (typeof window === 'undefined') return [];

  try {
    const userItemStr = localStorage.getItem('user');

    if (!userItemStr) return [];

    const userItem = JSON.parse(userItemStr);

    if (userItem?.privilege) {
      return typeof userItem.privilege === 'string'
        ? JSON.parse(userItem.privilege)
        : userItem.privilege;
    }
  } catch (error) {
    console.error("Error parsing privileges:", error);
    return [];
  }

  return [];
}

const Navigation = () => {
  const [notificationCount, setNotificationCount] = useState(0)

  // 👇 Example: get role (replace with context/auth/api in real app)
  const userRole =
    typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'admin' : 'staff'


  // 👇 All menu items with roles
  const allItems = [
    { privilege: ['dashboard'], title: 'Dashboard', icon: HomeOutline, path: '/', roles: ['admin', 'staff'] },
    { privilege: ['dispatch'], title: 'Dispatch', icon: MapSearch, path: '/dispatchPanel', roles: ['admin', 'staff'] },

    { privilege: ['customers', 'promo-coupon'], sectionTitle: 'Customers Management', icon: AccountGroup, roles: ['admin', 'staff'] },
    { privilege: ['customers'], title: 'Customers', icon: AccountGroup, path: '/customers', roles: ['admin', 'staff'] },
    { privilege: ['promo-coupon'], title: 'Promo Coupon', icon: FilePlus, path: '/promo-coupon', roles: ['admin', 'staff'] },

    { privilege: ['drivers', 'driver-wallet-history'], sectionTitle: 'Drivers Management', icon: Car, roles: ['admin', 'staff'] },
    { privilege: ['drivers'], title: 'Drivers', icon: Car, path: '/drivers', roles: ['admin', 'staff'] },
    { privilege: ['driver-wallet-history'], title: 'Driver Wallet History', icon: CurrencyUsd, path: '/driver-wallet-history', roles: ['admin', 'staff'] },

    { privilege: ['trips', 'manual-trips'], sectionTitle: 'Trips Management', icon: MapSearch, roles: ['admin', 'staff'] },
    { privilege: ['trips'], title: 'Trips', icon: MapSearch, path: '/trips', roles: ['admin', 'staff'] },
    { privilege: ['manual-trips'], title: 'Manual Trips', icon: FilePlus, path: '/admin-trips', roles: ['admin', 'staff'] },

    { privilege: ['driver-chat'], sectionTitle: 'Chat', icon: MessageText, roles: ['admin', 'staff'] },
    { privilege: ['driver-chat'], title: 'Driver Chat', icon: MessageText, path: '/chat-driver', roles: ['admin', 'staff'] },

    { privilege: ['zone'], sectionTitle: 'Zone Management', icon: MapMarkerRadius, roles: ['admin', 'staff'] },
    { privilege: ['zone'], title: 'Zone', icon: MapMarkerRadius, path: '/zones', roles: ['admin', 'staff'] },

    { privilege: ['advance-booking', 'common-notifications', 'trip-notification'], sectionTitle: 'Notification Management', icon: Bell, roles: ['admin', 'staff'] },
    { privilege: ['advance-booking'], title: 'Advance Booking', icon: ClipboardList, path: '/advanceBooking', roles: ['admin', 'staff'] },
    {
      privilege: ['common-notifications'],
      title: 'Common Notifications',
      icon: Bell,
      path: '/notification-messages',
      badge: notificationCount > 0,
      count: notificationCount,
      roles: ['admin', 'staff']
    },
    {
      privilege: ['trip-notification'],
      title: 'Trip Notification',
      icon: ClipboardList,
      path: '/trip-notifications',
      badge: notificationCount > 0,
      count: notificationCount,
      roles: ['admin', 'staff']
    },

    { privilege: ['payment-management', 'admin-earning'], sectionTitle: 'Payment', icon: CreditCardOutline, roles: ['admin'] },
    { privilege: ['payment-management'], title: 'Payment Management', icon: CreditCardOutline, path: '/payment-management', roles: ['admin'] },
    { privilege: ['admin-earning'], title: 'Admin Earning', icon: CurrencyUsd, path: '/admin-earning', roles: ['admin'] },

    { privilege: ['cities-setup', 'whatsapp-setup', 'force-app-update', 'helpline-numbers', 'whatsapp-keywords', 'support-numbers'], sectionTitle: 'Settings', icon: SettingsOutline, roles: ['admin', 'staff'] },
    { privilege: ['cities-setup'], title: 'Cities Setup', icon: MapMarkerRadius, path: '/cities-management', roles: ['admin', 'staff'] },
    { privilege: ['whatsapp-setup'], title: 'WhatsApp Setup', icon: MessageText, path: '/whatsapp-con', roles: ['admin', 'staff'] },
    { privilege: ['force-app-update'], title: 'Force App Update', icon: AccountCog, path: '/app-versions', roles: ['admin', 'staff'] },
    { privilege: ['helpline-numbers'], title: 'Helpline Numbers', icon: PhoneAndroid, path: '/help-line-number', roles: ['admin', 'staff'] },
    { privilege: ['support-numbers'], title: 'Support Numbers', icon: PhoneAndroid, path: '/support-numbers', roles: ['admin', 'staff'] },
    { privilege: ['whatsapp-keywords'], title: 'WhatsApp Keywords', icon: PhoneAndroid, path: '/whatsapp-keywords', roles: ['admin', 'staff'] },

    { privilege: ['outstation-package', 'outstation-fare', 'daily-fare-management', 'package'], sectionTitle: 'Fare Management', icon: Table, roles: ['admin', 'staff'] },
    { privilege: ['outstation-package'], title: 'Outstation Package', icon: FileDocument, path: '/outstation-package', roles: ['admin', 'staff'] },
    { privilege: ['outstation-fare'], title: 'Outstation Fare', icon: FileDocument, path: '/outstation-fare-management', roles: ['admin', 'staff'] },
    { privilege: ['daily-fare-management'], title: 'Daily Fare Management', icon: Table, path: '/daily-fare-management', roles: ['admin', 'staff'] },
    { privilege: ['package'], title: 'Package', icon: FolderOpen, path: '/package', roles: ['admin', 'staff'] },

    { privilege: ['view-bookings', 'add-one-way-trip', 'view-trips', 'add-package', 'view-package'], sectionTitle: 'Website Pages', icon: Web, roles: ['admin', 'staff', 'seo'] },
    { privilege: ['view-bookings'], title: 'View Bookings', icon: ViewList, path: '/websiteForm/viewBooking', roles: ['admin', 'staff'] },
    { privilege: ['add-one-way-trip'], title: 'Add One Way Trip', icon: FilePlus, path: '/websiteForm', roles: ['admin', 'staff', 'seo'] },
    { privilege: ['view-trips'], title: 'View Trips', icon: FormatListBulleted, path: '/websiteForm/view', roles: ['admin', 'staff', 'seo'] },
    { privilege: ['add-package'], title: 'Add Package', icon: ViewGridPlusOutline, path: '/tourPackages', roles: ['admin', 'staff', 'seo'] },
    { privilege: ['view-package'], title: 'View Package', icon: FileDocumentEdit, path: '/tourPackages/view', roles: ['admin', 'staff', 'seo'] },

    { privilege: ['staff-members', 'staff-privilege'], sectionTitle: 'Staff Management', icon: ShieldAccount, roles: ['admin'] },
    { privilege: ['staff-members'], title: 'Staff Members', icon: FileDocumentEdit, path: '/staff', roles: ['admin'] },
    { privilege: ['staff-privilege'], title: 'Staff Privilege', icon: FileDocumentEdit, path: '/staff/privilage', roles: ['admin'] },

    // {sectionTitle: 'Help Line Number', icon: PhoneAndroid, roles: ['admin', 'staff']},
    // {title: 'Change Help Line Number', icon: PhoneAndroid, path: '/help-line-number', roles: ['admin', 'staff']},


    // suru 20-12-2025
    { privilege: ['add-blog', 'view-blogs'], sectionTitle: 'Blogs', icon: Web, roles: ['admin', 'staff', 'seo',] },
    { privilege: ['add-blog'], title: 'Add Blog', icon: FilePlus, path: '/blogs/addBlog', roles: ['staff', 'seo'] },
    { privilege: ['view-blogs'], title: 'View Blogs', icon: FormatListBulleted, path: '/blogs', roles: ['staff', 'seo'] },

  ];



  let userPrivileges = getUserPrivilege();
  const privilegeSet = new Set(userPrivileges);

  // 👇 Filter items by role
  const filteredItems = allItems.filter(item => {
    // if (!item.roles) return true // no role restriction
    // return item.roles.includes(userRole)

    if (userRole == 'admin') return true;

    return item.privilege?.some(p => privilegeSet.has(p));
  })

  return filteredItems
}

export default Navigation
