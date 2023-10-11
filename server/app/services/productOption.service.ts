import createHttpError from "http-errors";
import { AppDataSource } from "../database";
import { EnumTypeImage, Image } from "../entities/image.entity";
import { Price } from "../entities/price.entity";
import { PriceHistory } from "../entities/priceHistoty.entity";
import { ProductOption } from "../entities/productOption.entity";
import { Warehouse } from "../entities/warehouse.entity";
import { BadRequestError, catchError } from "../utils/error";
import { failed, success } from "../utils/response";
import { productRepository } from "./product.service";

const productOptionRepository = AppDataSource.getRepository(ProductOption);

export interface ProductOptionInterface {
  flavor: string;
  weigth: string;
  price: number;
}

export const create = async (
  productId: number,
  product_options: ProductOptionInterface,
  imagePath: string
) => {
  try {
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) return createHttpError.BadRequest("product not found");
    if (product_options.price && imagePath) {
      const { flavor, weigth, price } = product_options;

      // price
      const priceRepo = AppDataSource.getRepository(Price);
      const priceHistoryRepo = AppDataSource.getRepository(PriceHistory);
      const tempPrice = priceRepo.create({
        price: price,
      });
      const new_price = await priceRepo.save(tempPrice);
      await priceHistoryRepo.save(
        priceHistoryRepo.create({
          old_price: price,
          new_price: price,
          price: new_price,
        })
      );

      const warehouseRepo = AppDataSource.getRepository(Warehouse);
      const imageRepo = AppDataSource.getRepository(Image);

      const new_options = productOptionRepository.create({
        flavor,
        weigth,
        price: new_price,
        product,
        warehouse: await warehouseRepo.save(
          warehouseRepo.create({ quantity: 1 })
        ),
        image: await imageRepo.save(
          imageRepo.create({
            type: EnumTypeImage.options,
            product: product,
            imageUrl: imagePath,
          })
        ),
      });
      return await productOptionRepository.save(new_options);
    }
    return createHttpError.BadRequest("please fill all the information");
  } catch (error) {
    return catchError(error, "something went wrong when add product option");
  }
};

export const deleteOne = async (id: number) => {
  const result = await productOptionRepository.delete({ id });
  return result.affected ? success() : failed();
};

export const updateOne = async (id: number, data: ProductOptionInterface) => {
  const option = await productOptionRepository.findOne({
    where: {
      id,
    },
    relations: {
      price: true,
    },
  });
  const { weigth, flavor, price } = data;
  if (!option) return BadRequestError("option not found");
  let price_update = 0;
  if (price) {
    const priceRepo = AppDataSource.getRepository(Price);
    const priceHistoty = AppDataSource.getRepository(PriceHistory);
    await priceHistoty.save(
      priceHistoty.create({
        old_price: option.price.price,
        new_price: price,
        price: option.price,
      })
    );
    await priceRepo.update({ id: option.price.id }, { price: price });
    price_update = 1;
  }
  return flavor || weigth
    ? {
        ...(await productOptionRepository.update({ id }, { flavor, weigth })),
        price_update,
      }
    : { price_update };
};

export const updateStock = async (id: number, quantity: number) => {
  const option = await productOptionRepository.findOne({
    where: {
      id,
    },
    relations: {
      warehouse: true,
    },
  });
  if (!option) return BadRequestError("option not found");
  const warehouseRepo = AppDataSource.getRepository(Warehouse);
  return (await warehouseRepo.update({ id: option.warehouse.id }, { quantity }))
    .affected
    ? success()
    : failed();
};

export const updatePrice = async (product_option_id: number, price: number) => {
  if (!price) return BadRequestError("new price empty");
  const priceRepo = AppDataSource.getRepository(Price);
  const priceHistoryRepo = AppDataSource.getRepository(PriceHistory);
  const productOption = await productOptionRepository.findOne({
    where: {
      id: product_option_id,
    },
    relations: {
      price: true,
    },
  });
  if (!productOption) return BadRequestError("product option not found");
  await priceHistoryRepo.save(
    priceHistoryRepo.create({
      old_price: productOption.price.price,
      new_price: price,
      price: productOption.price,
    })
  );

  return (await priceRepo.update({ id: productOption.price.id }, { price }))
    .affected
    ? success()
    : failed();
};
