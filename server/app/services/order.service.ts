import { AppDataSource } from "../database";
// import { Order } from "../entities/order.entity";
// import { OrderItem } from "../entities/orderItem.entity";
import { ProductOption } from "../entities/productOption.entity";
import { User } from "../entities/user.entity";
import { BadRequestError } from "../utils/error";

interface data_order {
    product_option_id: number,
    quantity: number
}

interface item_order {
    item: ProductOption;
    quantity: number;
}

export const createOrder = async (user_id: number, products: data_order[], address: string | null) => {
    const userRepo = AppDataSource.getRepository(User);
    // const orderRepo = AppDataSource.getRepository(Order);
    const productOptRepo = AppDataSource.getRepository(ProductOption);
    // const orderItemRepo = AppDataSource.getRepository(OrderItem);
    if(!user_id || !products)  return BadRequestError("missing information");
    const user = await userRepo.findOne({
        where: {
            id: user_id
        },
        relations: {
            address: true
        }
    });
    if(!user) return BadRequestError("user not found");

    enum OrderError {
        quantity_exceed,
        item_not_found,
        quantity_not_valid
    }

    interface error_info {
        type: string;
        product_option_id: number;
    }

    const err = {
        error: false,
        info: [] as error_info[]
    };

    const setError = (type: OrderError, product_option_id: number) => {
        err.error = true;
        err.info.push({
            type: OrderError[type],
            product_option_id
        });
    }

    const items: item_order[] = [];
    await Promise.all(products.map(async e => {
        const rs = await productOptRepo.findOne({
            where: { id: e.product_option_id },
            relations: {
                price: true,
                warehouse: true
            }
        });
        if(!rs) {
            setError(OrderError.item_not_found, e.product_option_id);
            return;
        }
        if(rs.warehouse.quantity < e.quantity) {
            setError(OrderError.quantity_exceed, e.product_option_id);
            return;
        }
        if(e.quantity <= 0) {
            setError(OrderError.quantity_not_valid, e.product_option_id);
            return;
        }

        return items.push({
            item: rs,
            quantity: e.quantity
        });
    }));
    if(!address && !user.default_address) return BadRequestError("please fill address");
    if(err.error) return {
        errors: err.info
    }

    // await orderRepo.save(orderRepo.create({
    //     address: address ? address : user.address.find(e => e.id === user.default_address)?.address,
    //     orderItems: items.map(async e => {
    //         return await orderItemRepo.save(orderItemRepo.create({
    //             product_option: e.item,
    //             quantity: e.quantity
    //         }))
    //     })

    // }));
    
    return {
        user,
        items,
        address: address ? address : user.address.find(e => e.id === user.default_address)?.address
    }
}