import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn()
  tokenId!: number;
  @Column({
    unique: true,
  })
  tokenName!: string;
  @Column()
  tokenValue!: string;
  @Column({ nullable: true })
  expire!: string;

  @ManyToOne(() => User, (user) => user.token, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
  })
  user!: User;
}
