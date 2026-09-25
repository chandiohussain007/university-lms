import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ default: false })
    isSuperAdmin: boolean;

    @OneToMany(() => Profile, (profile) => profile.user)
    profiles: Profile[];

}
