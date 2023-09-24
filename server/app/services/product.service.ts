import { And, ILike, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../database";
import { Brand } from "../entities/brand.entity";
import { Image, EnumTypeImage } from "../entities/image.entity";
import { Price } from "../entities/price.entity";
import { Product } from "../entities/product.entity";
import { ProductOption } from "../entities/productOption.entity";
import { Warehouse } from "../entities/warehouse.entity";
import { BadRequestError } from "../utils/error";
import { failed, success } from "../utils/response";
import { ProductOptionInterface } from "./productOption.service";
import { EnumWorkQueueType, WorkQueue } from "../entities/workQueue.entity";
import { PriceHistory } from "../entities/priceHistoty.entity";

interface ProductInterface {
  name: string;
  description: string;
}

export const productRepository = AppDataSource.getRepository(Product);

interface FilterProduct {
  brand_id: number | undefined;
  price: {
    min: number | undefined;
    max: number | undefined;
  };
  rate: number | undefined;
}

export const getAll = async (
  limit: number,
  page: number,
  filter: FilterProduct | null = null,
  search: string | undefined = undefined,
  order: string
) => {
  const offset = ((page ? page : 1) - 1) * limit;
  const [result, count] = await productRepository.findAndCount({
    relations: {
      images: true,
      productOptions: {
        price: true,
      },
      brand: true,
      feedbacks: true,
    },
    take: limit,
    skip: offset,
    where: {
      rate: filter?.rate ? `${filter.rate}` : undefined,
      name:
        search !== undefined && search !== "" && search !== null
          ? ILike(`%${search}%`)
          : undefined,
      brand: {
        id: filter?.brand_id ? filter.brand_id : undefined,
      },
      productOptions: {
        price: {
          price:
            filter?.price.min && filter?.price.max
              ? And(
                  MoreThanOrEqual(filter?.price.min),
                  LessThanOrEqual(filter?.price.max)
                )
              : undefined,
        },
      },
    },
    order: {
      id: order === "newest" ? "DESC" : "ASC",
    },
  });
  const last_page = Math.ceil(count / limit);
  const prev_page = page - 1 < 1 ? null : page - 1;
  const next_page = page + 1 > last_page ? null : page + 1;
  return result.length
    ? {
        current_page: page,
        prev_page,
        next_page,
        last_page,
        data_per_page: limit,
        total: count,
        ...(search !== undefined &&
          search !== "" &&
          search !== null && { search_query: search }),
        rate_filter: filter?.rate,
        data: result.map((e) => {
          return {
            id: e.id,
            name: e.name,
            description: e.description,
            images: e.images.find((e) => e.type === EnumTypeImage.thumbnail),
            brand: e.brand.name,
            rate: e.rate,
            product_options: e.productOptions.map((el) => {
              return {
                product_option_id: el.id,
                price: el.price.price,
              };
            }),
          };
        }),
      }
    : BadRequestError("product not found!");
};

export const create = async (
  product: ProductInterface,
  options: ProductOptionInterface,
  image_path: string,
  brand_id: number
) => {
  const { name: name, description: description } = product;
  const brandRepo = AppDataSource.getRepository(Brand);
  const brand = await brandRepo.findOneBy({ id: brand_id });
  if (!brand) return BadRequestError("brand not found");
  if (name) {
    const productExists = await productRepository.findOneBy({ name });
    if (productExists) return BadRequestError("product name already exists");
    const productObj = productRepository.create({ name, description, brand });
    const newProduct = await productRepository.save(productObj);

    const productOptionRepository = AppDataSource.getRepository(ProductOption);
    const { color, ram, rom, price } = options;

    // price
    const priceRepo = AppDataSource.getRepository(Price);
    const tempPrice = price
      ? priceRepo.create({
          price: price,
        })
      : priceRepo.create({
          price: 1_000_000,
        });
    const newPrice = await priceRepo.save(tempPrice);
    const priceHistoryRepo = AppDataSource.getRepository(PriceHistory);
    await priceHistoryRepo.save(
      priceHistoryRepo.create({
        old_price: price,
        new_price: price,
        price: newPrice,
      })
    );

    // init warehouse stock
    const warehouseRepo = AppDataSource.getRepository(Warehouse);
    const newWarehouse = await warehouseRepo.save(
      warehouseRepo.create({ quantity: 1 })
    );

    const imageRepo = AppDataSource.getRepository(Image);
    const tempImage = imageRepo.create({
      image_url: image_path,
      product: newProduct,
      type: EnumTypeImage.thumbnail,
    });
    const newImage = await imageRepo.save(tempImage);
    const image_opt = await imageRepo.save(
      imageRepo.create({
        image_url: image_path,
        product: newProduct,
        type: EnumTypeImage.options,
      })
    );
    const opt =
      color && ram && rom
        ? productOptionRepository.create({
            color,
            ram,
            rom,
            product: newProduct,
            price: newPrice,
            warehouse: newWarehouse,
            image: image_opt,
          })
        : productOptionRepository.create({
            color: "black",
            ram: "8GB",
            rom: "128GB",
            product: newProduct,
            price: newPrice,
            warehouse: newWarehouse,
            image: image_opt,
          });

    const newOtp = await productOptionRepository.save(opt);

    return {
      new_product: newProduct,
      new_options: newOtp,
      new_image: newImage,
    };
  }
  return BadRequestError("missing information!");
};

export const getOneById = async (id: number) => {
  const product = await productRepository.findOne({
    where: {
      id,
    },
    relations: {
      brand: true,
      specifications: true,
      images: true,
      productOptions: {
        price: true,
        warehouse: true,
        image: true,
      },
      feedbacks: true,
    },
  });
  return product
    ? {
        id: product.id,
        name: product.name,
        description: product.description,
        createAt: product.createAt,
        updateAt: product.updateAt,
        brand: product.brand.name,
        brand_id: product.brand.id,
        brand_description: product.brand.description,
        rate: product.rate,
        feedback: product.feedbacks.map((e) => {
          return {
            ...e,
          };
        }),
        specs: product.specifications.map((e) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // const { id, ...rest } = e;
          return { ...e };
        }),
        images: product.images.filter((e) => e.type === EnumTypeImage.desc),
        product_options: product.productOptions.map((e) => {
          return {
            product_option_id: e.id,
            color: e.color,
            ram: e.ram,
            rom: e.rom,
            price: e.price.price,
            quantity: e.warehouse.quantity,
            image: e.image,
          };
        }),
      }
    : BadRequestError("product not found!");
};

export const update = async (
  id: number,
  product: ProductInterface,
  brand_id = -1
) => {
  const _product = await productRepository.findOne({
    where: {
      id,
    },
    relations: {
      brand: true,
    },
  });
  if (!_product) return BadRequestError("product not found!");
  const brandRepo = AppDataSource.getRepository(Brand);
  const brand = await brandRepo.findOneBy({
    id: brand_id !== -1 ? brand_id : _product.brand.id,
  });
  if (!brand) return BadRequestError("error when retrieve brand");
  // console.log(brand);

  return (await productRepository.update({ id }, { ...product, brand }))
    .affected
    ? success()
    : failed();
};

export const deleteOne = async (id: number) => {
  return (await productRepository.delete({ id })).affected
    ? success()
    : failed();
};

export const addImages = async (product_id: number, image: string[]) => {
  const imageRepo = AppDataSource.getRepository(Image);
  const product = await productRepository.findOneBy({ id: product_id });
  if (!product) return BadRequestError("product not found");
  if (!image.length) return BadRequestError("image empty");
  return await Promise.all(
    image.map((e) => {
      return imageRepo.save(
        imageRepo.create({
          type: EnumTypeImage.desc,
          image_url: e,
          product: product,
        })
      );
    })
  );
};

export const canRate = async (product_id: number, user_id: number) => {
  const workRepo = AppDataSource.getRepository(WorkQueue);
  const data = await workRepo.findOneBy({
    product: {
      id: product_id,
    },
    user: {
      id: user_id,
    },
  });

  return data && data.type === EnumWorkQueueType.RATE
    ? {
        can_rate: true,
        is_done: data.is_done,
      }
    : {
        can_rate: false,
      };
};
