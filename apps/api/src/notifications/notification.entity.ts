import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from '../users/entities/user.entity';

export enum NotificationType {
    ASSIGNMENT_POSTED = 'ASSIGNMENT_POSTED',
    GRADE_POSTED = 'GRADE_POSTED',
    ADMISSION_STATUS = 'ADMISSION_STATUS',
    ATTENDANCE_WARNING = 'ATTENDANCE_WARNING',
    GENERAL = 'GENERAL',
}

@Entity('notifications')
export class Notification extends BaseEntity {
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.GENERAL,
    })
    type: NotificationType;

    @Column({ type: 'boolean', default: false })
    isRead: boolean;
}
