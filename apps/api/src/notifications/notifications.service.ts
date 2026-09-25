import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async createNotification(dto: { userId: string; title: string; message: string; type?: NotificationType }) {
        const notif = this.notificationRepository.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            type: dto.type || NotificationType.GENERAL,
        });
        return this.notificationRepository.save(notif);
    }

    async findMyNotifications(userId: string) {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }

    async markAsRead(id: string, userId: string) {
        const notif = await this.notificationRepository.findOne({ where: { id, userId } });
        if (!notif) throw new NotFoundException('Notification not found');
        notif.isRead = true;
        return this.notificationRepository.save(notif);
    }

    async markAllAsRead(userId: string) {
        await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
        return { success: true };
    }
}
