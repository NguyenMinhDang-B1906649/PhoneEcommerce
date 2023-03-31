import { AiFillBank } from 'react-icons/ai';
import { BsPeopleFill } from 'react-icons/bs';
import { FaCartPlus, FaFileSignature } from 'react-icons/fa';

import { PieChart } from './chart/PieChart';
import { LineChart } from './chart/LineChart';
import { useQuery } from '@tanstack/react-query';
import analysisApi from 'src/apis/analysis.api';

type card_props = {
  title: string;
  value: string;
  // percent_compare: string;
  icon: number;
};

const Card = (props: card_props) => {
  const icons = [
    {
      class: 'from-blue-600 to-blue-400',
      icon: FaCartPlus,
    },
    {
      class: 'from-green-600 to-green-400',
      icon: AiFillBank,
    },
    {
      class: 'from-pink-600 to-pink-400',
      icon: FaFileSignature,
    },
    {
      class: 'from-orange-600 to-orange-400',
      icon: BsPeopleFill,
    },
  ];

  const { icon: index } = props;
  const Icon = icons[index].icon;

  return (
    <div
      className={`${props.icon === 0 && `lg:-ml-1`} ${
        props.icon === 3 && `lg:-mr-0`
      } mx-4 mb-4 mt-8 rounded-lg bg-white shadow-lg`}
    >
      <div
        className={`mx-4 overflow-hidden rounded-xl bg-gradient-to-tr bg-clip-border ${
          icons[props.icon].class
        } absolute -mt-4 grid h-16 w-16 place-items-center text-white shadow-lg shadow-pink-500/40`}
      >
        <Icon className='text-lg' size={25} />
      </div>
      <div className='p-4 text-right text-gray-800'>
        <div className='mb-2 font-semibold'>{props.title}</div>
        <div className='text-4xl font-semibold leading-relaxed'>{props.value}</div>
        {/* <hr className='mt-4 mb-2 bg-gray-400' /> */}
        {/* <div className='text-left'>{props.percent_compare}</div> */}
      </div>
    </div>
  );
};

function MainDashboard() {
  const overview = useQuery(['analysis_overview'], () => analysisApi.analysOverview());
  const top_sale = useQuery(['top_sales'], () => analysisApi.topSales());

  return (
    <div>
      <div className='grid md:grid-cols-2 lg:grid-cols-4'>
        <Card title='Total Products' value={overview.data?.data.countProducts} icon={0} />
        <Card title='Total Orders' value={overview.data?.data.countOrders} icon={2} />
        <Card title='Total Brands' value={overview.data?.data.countBrands} icon={1} />
        <Card title='Total Users' value={overview.data?.data.countBrands} icon={3} />
      </div>
      <div className='mt-2 grid grid-flow-col grid-cols-3 gap-8'>
        <div className='col-span-2 -ml-1 mr-2 rounded-xl rounded-xl bg-white bg-white p-9 p-2 shadow-lg'>
          <LineChart />
        </div>
        <div className='flex rounded-xl rounded-xl bg-white p-8 shadow-lg'>
          <PieChart />
        </div>
      </div>

      <div className='mt-4 -ml-1 grid grid-flow-col grid-cols-4 gap-8'>
        <div className='col-span-2 rounded-xl bg-white p-8 shadow-lg'>
          <div className=' -mt-6 -ml-4'>
            <div className='text-xl font-semibold leading-loose'>Top Sales</div>
          </div>
          <hr className='-ml-6 bg-gray-300' />
          <div>
            {top_sale.data?.data.map((e: any, i: string) => (
              <div key={i.toString()}>{e.product_id}</div>
            ))}
          </div>
        </div>
        <div className='col-span-2 rounded-xl bg-white p-8 shadow-lg'>
          <div className=' -mt-6 -ml-4'>
            <div className='text-xl font-semibold leading-loose'>Recent activity</div>
          </div>
          <hr className='-ml-6 bg-gray-300' />
        </div>
      </div>
    </div>
  );
}
export default MainDashboard;
