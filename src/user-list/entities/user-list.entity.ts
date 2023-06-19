import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserList {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length:40})
    username: string

    @Column({length:40,unique:true})
    email: string

    @Column()
    password: string

    @Column({ default: false })
    isVerified: boolean

    @Column({default:0})
    attempts: number

    @Column({ default: false })
    blocked: boolean

    @Column({default:null})
    blockedTime: Date

    @Column({default:true})
    isActive:boolean

    @CreateDateColumn()
    created_at:Date

    @Column({nullable:true})
    created_by:number

    @UpdateDateColumn({nullable:true})
    updated_at:Date

    @Column({nullable:true})
    updated_by:number

}
