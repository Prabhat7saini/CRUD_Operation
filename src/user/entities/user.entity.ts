import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column({})
    lastName: string;

    @Column()
    age: string;

    @Column()
    email: string;
    @Column()
    password: string;

    @Column({ nullable: true })
    refreshToken: string;
    @DeleteDateColumn()
    deletedAt?: Date;
}
