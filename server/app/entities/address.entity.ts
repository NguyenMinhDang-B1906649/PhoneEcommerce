import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("address")
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  address!: string;

  @ManyToOne(() => User, (user) => user.address, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "userId",
  })
  user!: User;
}
