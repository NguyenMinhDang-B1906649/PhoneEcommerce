import { useQuery } from '@tanstack/react-query';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import brandApi from 'src/apis/brand.api';
import productsApi from 'src/apis/product.api';
import HelmetSale from 'src/components/Helmet';
import Loading from 'src/components/loading';
import Pagination from 'src/components/paginate';
import Product from 'src/components/product';
import path from 'src/constants/path';
import useQueryParams from 'src/hooks/useQueryParams';
import { ProductListConfig } from 'src/types/product.type';
import { isAxiosErr } from 'src/utils/error';
import AsignFillter from './asignfilter';

// import SortProduct from './sortlist';

function ProductList() {
  const query = useQueryParams();
  const queryParams: ProductListConfig = {
    page: query.page ? query.page : '1',
    limit: query.limit ? query.limit : '10',
    brandId: query.brandId,
    price_min: query.price_min,
    price_max: query.price_max,
    rate: query.rate ? query.rate : '0',
    search: query.search || '',
  };
  const navigate = useNavigate();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.getProductsList(queryParams),
    onError: (err) => {
      if (
        isAxiosErr<{
          error: string;
        }>(err)
      ) {
        if (err.response?.data.error === 'product not found!' && queryParams.page !== '1') {
          navigate({
            pathname: path.home,
            search: createSearchParams({ ...queryParams, page: '1' }).toString(),
          });
        }
        if (err.response?.data.error === 'product not found!' && queryParams.page === '1') {
          navigate({
            pathname: path.home,
            search: createSearchParams({ page: '1' }).toString(),
          });
          toast.error('Không tìm thấy sản phẩm phù hợp', {
            autoClose: 2000,
          });
        }
      }
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const { data: brands } = useQuery({
    queryKey: ['brand'],
    queryFn: () => brandApi.getAllBrand(''),
    refetchOnWindowFocus: false,
    retry: 1,
  });
  return (
    <div className='mx-auto mb-4 min-h-[42rem] max-w-7xl bg-slate-50 py-4 px-2 shadow-sm'>
      <HelmetSale title='Trang chủ'></HelmetSale>
      <div className='grid grid-cols-12 gap-4 overflow-hidden'>
        <div className='hidden md:col-span-3 md:block'>
          <AsignFillter brands={brands?.data || []} queryConfig={queryParams} />
        </div>
        <div className='relative col-span-12 md:col-span-9'>
          {isLoading && (
            <div className='flex h-full w-full justify-center pt-[10rem]'>
              <Loading />
            </div>
          )}
          <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {products &&
              products.data.data &&
              products.data.data.map((product) => {
                return (
                  <div className='col-span-1 min-h-[280px]' key={product.id}>
                    <Product product={product} />
                  </div>
                );
              })}
          </div>
          <div className='flex flex-col justify-end'>
            <Pagination queryConfig={queryParams} pageSize={products?.data.last_page || 1} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductList;
