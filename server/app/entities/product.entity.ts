import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Brand } from "./brand.entity";
import { Specification } from "./specification.entity";
import { Image } from "./image.entity";
import { ProductOption } from "./productOption.entity";
import { Feedback } from "./feedback.entity";
import { Category } from "./category.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    nullable: true,
    type: "longtext",
  })
  description!: string;

  @Column({
    type: "date",
  })
  productionDate!: string;

  @Column({
    type: "date",
  })
  expirationDate!: string;

  @CreateDateColumn()
  createAt!: Date;

  @UpdateDateColumn()
  updateAt!: Date;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "brandId",
  })
  brand!: Brand;

  @OneToMany(() => Specification, (specification) => specification.product)
  specifications!: Specification[];

  @OneToMany(() => Image, (image) => image.product)
  images!: Image[];

  @OneToMany(() => ProductOption, (productOption) => productOption.product)
  productOptions!: ProductOption[];

  @OneToMany(() => Feedback, (feedback) => feedback.product)
  feedbacks!: Feedback[];

  @ManyToOne(() => Category, (category) => category.product)
  @JoinColumn({
    name: "cateId",
  })
  category!: Category;
  @Column({
    default: "0",
  })
  rate!: string;
}
