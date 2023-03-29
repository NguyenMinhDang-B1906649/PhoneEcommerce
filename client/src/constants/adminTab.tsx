import InventoryDashboard from 'src/components/admindashboard/inventorydashboard';
import MainDashboard from 'src/components/admindashboard/maindashboard/MainDashboard';
import OrderDashboard from 'src/components/admindashboard/orderdashboard';
import ProductDashboard from 'src/components/admindashboard/productdashboard';
import ManageBrand from 'src/components/admindashboard/productdashboard/ManageBrand';
import ManageCoupon from 'src/components/admindashboard/productdashboard/ManageCoupon';
import ManageProduct from 'src/components/admindashboard/productdashboard/ManageProduct';
import ReportDashboard from 'src/components/admindashboard/reportdashboard';
import UserDashboard from 'src/components/admindashboard/userdashboard';

export interface dashboardTabInterface {
  name: string;
  component: JSX.Element;
  link: string;
}

export const dashboard_tab: dashboardTabInterface[] = [
  { name: 'home', component: <MainDashboard />, link: '/' },
  { name: 'products', component: <ManageProduct />, link: '/product' },
  { name: 'product', component: <ProductDashboard />, link: '/product' },
  { name: 'brand', component: <ManageBrand />, link: '/brand' },
  { name: 'coupon', component: <ManageCoupon />, link: '/coupon' },
  { name: 'order', component: <OrderDashboard />, link: '/order' },
  { name: 'inventory', component: <InventoryDashboard />, link: '/inventory' },
  { name: 'report', component: <ReportDashboard />, link: '/report' },
  { name: 'user', component: <UserDashboard />, link: '/user' },
];
