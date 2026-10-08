import { useState } from 'react'
import { getAllMenuItems } from './menuItems'

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
  const allItems = getAllMenuItems(notificationCount);



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
