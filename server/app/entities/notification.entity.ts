import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum EnumTypeNotify {
  EMPTY,
  NEW_ORDER,
  USER_FEEDBACK,
  SHIPPED,
  COMPLETED,
  CANCELLED,
  RETURNED,
  RETURNED_COMPLETED,
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @Column({
    type: "enum",
    enum: EnumTypeNotify,
  })
  type!: EnumTypeNotify;

  @Column({
    type: "boolean",
    default: false,
  })
  is_read!: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
  })
  user!: User;

  @CreateDateColumn()
  time!: Date;
}
