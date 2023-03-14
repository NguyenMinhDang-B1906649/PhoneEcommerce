import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity("feedback")
export class Feedback {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "int",
        nullable: false,
    })
    rate!: number;

    @Column({
        nullable: true
    })
    comment!: string;

    @CreateDateColumn()
    create_at!: Date;

    @ManyToOne(
        () => Product,
        product => product.feedbacks,
        {
            onDelete: "CASCADE"
        }
    )
    @JoinColumn({
        name:"product_id"
    })
    product!: Product;

    @ManyToOne(
        () => User,
        user => user.feedbacks,
        {
            onDelete: "CASCADE"
        }
    )
    @JoinColumn({
        name: "user_id"
    })
    user!: User;
    
}
